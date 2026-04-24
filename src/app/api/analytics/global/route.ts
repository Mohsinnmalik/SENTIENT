import { NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { SessionReport, Product, Session, User } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    // You could restrict global analytics to an admin, but the user requested:
    // "Transform SENTIENT into a real multi-user AI analytics platform where each user has secure access to their own product insights"
    // Wait, the user said "GLOBAL ANALYTICS PAGE: Show total users, total sessions, conversion rate, average engagement".
    // I will return global platform stats (anonymized) to any authenticated user.
    if (!authUser) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    
    // Aggregations using MongoDB Pipelines
    const [userCount, sessionCount, reportStats] = await Promise.all([
       User.countDocuments(),
       Session.countDocuments(),
       SessionReport.aggregate([
          {
            $group: {
              _id: null,
              totalReports: { $sum: 1 },
              averageScore: { $avg: "$overallScore" },
              totalBuyers: { $sum: { $cond: [{ $eq: ["$visitorType", "Buyer"] }, 1, 0] } }
            }
          }
       ])
    ]);

    const stats = reportStats[0] || { totalReports: 0, averageScore: 0, totalBuyers: 0 };
    const conversionRate = sessionCount > 0 ? ((stats.totalBuyers / sessionCount) * 100).toFixed(1) : 0;

    return jsonResponse(true, "Global analytics fetched", {
       totalUsers: userCount,
       totalSessions: sessionCount,
       conversionRate: `${conversionRate}%`,
       averageEngagement: stats.averageScore?.toFixed(1) || 0
    });
  } catch (error: unknown) {
    const err = error as Error;
    return jsonResponse(false, "Internal Error", err.message, 500);
  }
}
