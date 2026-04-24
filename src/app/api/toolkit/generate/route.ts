import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Toolkit, Product } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    const { productId } = await req.json();
    
    if (!productId) {
      return jsonResponse(false, "Product ID is required", null, 400);
    }

    // Verify product belongs to user
    const product = await Product.findOne({ _id: productId, userId: user.userId });
    if (!product) {
      return jsonResponse(false, "Product not found or unauthorized", null, 403);
    }

    // Mock AI Questions - In a real production app, these would come from an LLM call
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
      userId: user.userId,
      productId,
      reviewQuestions,
      qualifierQuestions,
      scoringCriteria,
    });
    
    return jsonResponse(true, "Toolkit generated successfully", toolkit, 201);
  } catch (error: unknown) {
    const err = error as Error;
    return jsonResponse(false, "Internal Error", err.message, 500);
  }
}
