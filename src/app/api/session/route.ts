import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Session, Answer, Toolkit } from "@/models/Schema";

// Get Session Details
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const session = await Session.findById(id).populate("productId");
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const toolkit = await Toolkit.findOne({ productId: session.productId._id });
    
    return NextResponse.json({ session, toolkit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle Session Actions
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { action, productId, sessionId, question, answer, score } = await req.json();
    
    // 1. START SESSION
    if (action === "start") {
      const session = await Session.create({ productId, status: "active" });
      return NextResponse.json(session, { status: 201 });
    }

    // 2. SAVE ANSWER
    if (action === "answer") {
      // Mock Behavioral Signal Logic
      const signals = ["High Intent 🔥", "Neutral", "Low Interest ⚠️"];
      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      
      const newAnswer = await Answer.create({
        sessionId,
        question,
        answer,
        score: score || Math.floor(Math.random() * 10),
        signal: randomSignal,
      });
      return NextResponse.json(newAnswer, { status: 201 });
    }

    // 3. END SESSION
    if (action === "end") {
      const session = await Session.findByIdAndUpdate(sessionId, { 
        status: "completed",
        endedAt: new Date()
      }, { new: true });
      
      const answers = await Answer.find({ sessionId });
      
      return NextResponse.json({ session, report: answers }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
