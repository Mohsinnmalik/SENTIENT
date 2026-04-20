import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { SessionReport, Session } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    const body = await req.json();

    // Verify session belongs to user
    const sessionDoc = await Session.findOne({ _id: body.sessionId, userId: user.userId });
    if (!sessionDoc) {
      return jsonResponse(false, "Unauthorized target session", null, 403);
    }
    
    body.userId = user.userId;
    if (!body.productId) {
      body.productId = sessionDoc.productId;
    }

    const report = await SessionReport.create(body);
    return jsonResponse(true, "Report generated successfully", report, 201);
  } catch (error: any) {
    return jsonResponse(false, "Internal Error", error.message, 500);
  }
}

// Fetch report or all reports for user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (id) {
       // Single report
       const report = await SessionReport.findOne({ _id: id, userId: user.userId });
       if (!report) return jsonResponse(false, "Report not found", null, 404);
       return jsonResponse(true, "Report fetched successfully", report);
    } else {
       // All reports for user
       const reports = await SessionReport.find({ userId: user.userId }).sort({ createdAt: -1 });
       return jsonResponse(true, "Reports fetched successfully", reports);
    }
  } catch (error: any) {
    return jsonResponse(false, "Internal error", error.message, 500);
  }
}
