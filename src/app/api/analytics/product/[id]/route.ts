import { NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { SessionReport, Product, Answer } from "@/models/Schema";
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
    
    const product = await Product.findOne({ _id: productId, userId: user.userId });
    if (!product) return jsonResponse(false, "Product not found or unauthorized", null, 404);

    const pId = new mongoose.Types.ObjectId(productId);
    const uId = new mongoose.Types.ObjectId(user.userId);

    // 1. Core Global Stats — FIX 7: exclude demo sessions
    const summaryPipeline = [
      { $match: { productId: pId, userId: uId, isDemo: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgScore: { $avg: "$overallScore" },
          avgDuration: { $avg: "$interactionDuration" },
          avgVerbal: { $avg: "$verbalScore" },
          avgBehavioural: { $avg: "$behaviourScore" },
          strongBuyers: { $sum: { $cond: [{ $eq: ["$visitorType", "Buyer"] }, 1, 0] } },
          interestedUsers: { $sum: { $cond: [{ $eq: ["$visitorType", "Interested"] }, 1, 0] } },
          browsingUsers: { $sum: { $cond: [{ $eq: ["$visitorType", "Browsing"] }, 1, 0] } },
        }
      }
    ];

    const summaryResults = await SessionReport.aggregate(summaryPipeline);
    const stats = summaryResults[0] || {
      totalSessions: 0, avgScore: 0, avgDuration: 0, avgVerbal: 0, avgBehavioural: 0,
      strongBuyers: 0, interestedUsers: 0, browsingUsers: 0
    };

    // 2. Trend Analysis (Last 3 vs Global — FIX 7: real sessions only)
    const lastThree = await SessionReport.find({ productId: pId, userId: uId, isDemo: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("overallScore");
    
    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (lastThree.length > 0 && stats.totalSessions > 3) {
      const lastAvg = lastThree.reduce((acc, s) => acc + s.overallScore, 0) / lastThree.length;
      if (lastAvg > stats.avgScore + 0.2) trend = "increasing";
      else if (lastAvg < stats.avgScore - 0.2) trend = "decreasing";
    }

    // 3. Conversion Rate
    const conversionRate = stats.totalSessions > 0 
      ? (((stats.strongBuyers + stats.interestedUsers) / stats.totalSessions) * 100).toFixed(1)
      : "0";

    // 4. Insight Generation
    const insights = [];
    if (stats.totalSessions > 0) {
      // Logic for Verbal vs Behavioural gap
      if (stats.avgVerbal > stats.avgBehavioural + 2) {
        insights.push({
          title: "Interest Disconnect Detected",
          text: "Users express high verbal interest, but their behavioral engagement (mouse/keyboard activity) does not match. High risk of passive browsing.",
          priority: "HIGH",
          type: "warning"
        });
      }

      // Logic for Conversion Potential
      if (parseFloat(conversionRate) > 60) {
        insights.push({
          title: "High Conversion Momentum",
          text: "Over 60% of sessions show active purchase intent signals. The current array configuration is effectively filtering for real buyers.",
          priority: "POSITIVE",
          type: "success"
        });
      } else if (stats.totalSessions > 5) {
        insights.push({
          title: "Optimized Target Opportunity",
          text: "Current conversion rate suggests a broad browsing audience. Refining the qualifier questions could increase lead quality.",
          priority: "MEDIUM",
          type: "neutral"
        });
      }

      // Logic for Average Score drop-off
      if (trend === "decreasing") {
        insights.push({
          title: "Experience Sentiment Drop",
          text: "Recent sessions show a decline in overall sentiment score compared to historical data. Investigate recent changes to product description or pricing nodes.",
          priority: "HIGH",
          type: "danger"
        });
      }
    }

    // 5. Confidence Explanation
    let confidenceExplanation = "Not enough telemetry data for a confident synthesis.";
    if (stats.totalSessions > 10) {
      confidenceExplanation = "High confidence output based on a robust dataset of 10+ sessions with consistent behavioral signal patterns.";
    } else if (stats.totalSessions > 3) {
      confidenceExplanation = "Moderate confidence based on initial session clusters; signals are beginning to stabilize.";
    }

    // 6. Most Asked Questions — optimized: direct aggregation without pre-fetching session IDs
    const mostAskedQuestions = await Answer.aggregate([
      {
        $lookup: {
          from: "sessions",
          localField: "sessionId",
          foreignField: "_id",
          as: "session",
        },
      },
      { $unwind: "$session" },
      {
        $match: {
          "session.productId": pId,
          "session.userId": uId,
        },
      },
      { $group: { _id: "$question", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { question: "$_id", count: 1, _id: 0 } },
    ]);

    // FIX: historicalSessions excludes demo sessions for clean interaction history
    const historicalSessions = await SessionReport
      .find({ productId: pId, userId: uId, isDemo: { $ne: true } })
      .sort({ createdAt: -1 });

    return jsonResponse(true, "Product analytics synthesized", {
      product,
      stats: {
        ...stats,
        conversionRate,
        trend,
        confidenceExplanation,
        strongBuyerPct: stats.totalSessions > 0 ? ((stats.strongBuyers / stats.totalSessions) * 100).toFixed(1) : "0",
        interestedPct: stats.totalSessions > 0 ? ((stats.interestedUsers / stats.totalSessions) * 100).toFixed(1) : "0",
        browsingPct: stats.totalSessions > 0 ? ((stats.browsingUsers / stats.totalSessions) * 100).toFixed(1) : "0",
      },
      insights,
      mostAskedQuestions,
      historicalSessions
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Analytics Product Error]", err);
    return jsonResponse(false, "Internal server error", null, 500);
  }
}
