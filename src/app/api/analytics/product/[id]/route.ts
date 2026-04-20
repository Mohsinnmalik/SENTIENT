import { NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { SessionReport, Product, Session, Answer } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    const { id: productId } = await params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
       return jsonResponse(false, "Invalid product ID", null, 400);
    }

    await dbConnect();
    
    // Ensure product belongs to user
    const product = await Product.findOne({ _id: productId, userId: user.userId });
    if (!product) return jsonResponse(false, "Product not found or unauthorized", null, 404);

    const pId = new mongoose.Types.ObjectId(productId);
    const uId = new mongoose.Types.ObjectId(user.userId);

    // 1. Session Stats Aggregation
    const pipeline = [
      { $match: { productId: pId, userId: uId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          averageScore: { $avg: "$overallScore" },
          averageDuration: { $avg: "$interactionDuration" },
          strongBuyers: { $sum: { $cond: [{ $eq: ["$visitorType", "Buyer"] }, 1, 0] } },
          interestedUsers: { $sum: { $cond: [{ $eq: ["$visitorType", "Interested"] }, 1, 0] } },
          browsingUsers: { $sum: { $cond: [{ $eq: ["$visitorType", "Browsing"] }, 1, 0] } },
        }
      }
    ];

    const results = await SessionReport.aggregate(pipeline);
    
    let stats = results[0];
    if (!stats) {
      stats = { totalSessions: 0, averageScore: 0, averageDuration: 0, strongBuyers: 0, interestedUsers: 0, browsingUsers: 0 };
    }

    // Assigning Percentages
    const total = stats.totalSessions > 0 ? stats.totalSessions : 1;
    stats.strongBuyerPct = ((stats.strongBuyers / total) * 100).toFixed(1);
    stats.interestedPct = ((stats.interestedUsers / total) * 100).toFixed(1);
    stats.browsingPct = ((stats.browsingUsers / total) * 100).toFixed(1);

    // 2. Fetch ALL historical sessions for this product
    const historicalSessions = await SessionReport.find({ productId: pId, userId: uId }).sort({ createdAt: -1 });

    // 3. Most Asked Questions (Find active sessions, then query Answers)
    const sessions = await Session.find({ productId: pId, userId: uId }).select('_id');
    const sessionIds = sessions.map(s => s._id);

    let mostAskedQuestions = [];
    if (sessionIds.length > 0) {
      mostAskedQuestions = await Answer.aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        { $group: { _id: "$question", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
        { $project: { question: "$_id", count: 1, _id: 0 } }
      ]);
    }

    return jsonResponse(true, "Product analytics fetched", {
       product,
       stats,
       historicalSessions,
       mostAskedQuestions
    });
  } catch (error: any) {
    return jsonResponse(false, "Internal Error", error.message, 500);
  }
}
