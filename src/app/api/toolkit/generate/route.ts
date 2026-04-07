import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Toolkit } from "@/models/Schema";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Mock AI Questions
    const reviewQuestions = [
      "How would you describe the overall build quality of this product?",
      "Which specific feature stood out to you the most during your initial use?",
      "In what scenario would you find this product most indispensable?",
      "On a scale of 1-10, how intuitive was the initial setup process?",
      "What is the one thing you would change to improve the user experience?"
    ];

    const qualifierQuestions = [
      "Are you currently in the market for a solution of this type?",
      "Who else would you recommend this product to?",
      "How frequently do you envision using this product?"
    ];

    const scoringCriteria = "Scoring is determined by the depth of verbal feedback (40%) and interaction-based behavioural signals (60%).";

    const toolkit = await Toolkit.create({
      productId,
      reviewQuestions,
      qualifierQuestions,
      scoringCriteria,
    });
    
    return NextResponse.json(toolkit, { status: 201 });
  } catch (error: any) {
    console.error("Error generating toolkit:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
