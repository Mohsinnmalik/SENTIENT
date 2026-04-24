import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { Session, Answer, Toolkit, Product } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

// 1. GET SESSION DETAILS
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return jsonResponse(false, "ID is required", null, 400);

    const session = await Session.findOne({ _id: id, userId: user.userId }).populate("productId");
    if (!session) return jsonResponse(false, "Session not found or unauthorized", null, 404);

    const toolkit = await Toolkit.findOne({ productId: session.productId._id, userId: user.userId });
    
    return jsonResponse(true, "Session details fetched", { session, toolkit });
  } catch (error) {
    return jsonResponse(false, "Internal Error", error.message, 500);
  }
}

// 2. HANDLE SESSION ACTIONS (START, ANSWER, END)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    const body = await req.json();
    const { action, productId, sessionId, question, answer, score } = body;

    // START SESSION
    if (action === "start") {
      if (!productId) return jsonResponse(false, "productId required for start", null, 400);
      
      const product = await Product.findOne({ _id: productId, userId: user.userId });
      if (!product) return jsonResponse(false, "Product not found", null, 404);
      
      // FIX 7: pass isDemoSession flag from body
      const session = await Session.create({
        userId: user.userId,
        productId,
        status: "active",
        isDemoSession: !!body.isDemoSession,
      });
      return jsonResponse(true, "Session started", session, 201);
    }

    // SAVE ANSWER
    if (action === "answer") {
      if (!sessionId || !question || !answer) return jsonResponse(false, "Missing fields for answer", null, 400);
      
      const session = await Session.findOne({ _id: sessionId, userId: user.userId });
      if (!session) return jsonResponse(false, "Unauthorized session", null, 403);

      // Derive signal from score, not random selection
      const validatedScore = typeof score === 'number' ? Math.min(10, Math.max(0, score)) : 5;
      const derivedSignal =
        validatedScore > 7 ? "High Intent 🔥" :
        validatedScore > 4.5 ? "Positive Engagement" : "Low Interest ⚠️";
      
      const newAnswer = await Answer.create({
        userId: user.userId,
        sessionId,
        question,
        answer,
        score: validatedScore,
        signal: derivedSignal,
      });
      return jsonResponse(true, "Answer saved", newAnswer, 201);
    }

    // FIX 8: ENDING status — set before aggregation runs
    if (action === "ending") {
      if (!sessionId) return jsonResponse(false, "sessionId required", null, 400);
      await Session.findOneAndUpdate(
        { _id: sessionId, userId: user.userId },
        { status: "ending" }
      );
      return jsonResponse(true, "Session marked as ending");
    }

    // END SESSION
    if (action === "end") {
      if (!sessionId) return jsonResponse(false, "sessionId required for end", null, 400);

      const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId: user.userId }, 
        { status: "completed", endedAt: new Date() }, 
        { new: true }
      );
      
      if (!session) return jsonResponse(false, "Session not found or unauthorized", null, 404);

      const answers = await Answer.find({ sessionId, userId: user.userId });
      
      return jsonResponse(true, "Session completed", { session, report: answers });
    }

    return jsonResponse(false, "Invalid action", null, 400);
  } catch (error) {
    console.error("[Session API Error]", error);
    return jsonResponse(false, "Internal server error", null, 500);
  }
}
