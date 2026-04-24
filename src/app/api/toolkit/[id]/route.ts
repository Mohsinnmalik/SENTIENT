import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Toolkit, Product } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    const { id } = await params;

    if (id === "latest") {
      const toolkit = await Toolkit.findOne({ userId: user.userId }).sort({ createdAt: -1 }).populate("productId");
      if (!toolkit) return jsonResponse(false, "No toolkits found", null, 404);
      return jsonResponse(true, "Latest toolkit fetched", toolkit, 200);
    }

    let toolkit = null;
    
    // 1. Try finding by Toolkit ID
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        toolkit = await Toolkit.findOne({ _id: id, userId: user.userId }).populate("productId");
      }
    } catch {}

    // 2. Try finding by Product ID
    if (!toolkit) {
      try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          toolkit = await Toolkit.findOne({ productId: id, userId: user.userId }).populate("productId");
        }
      } catch {}
    }

    // 3. Auto-generation fallback (Self-healing for newly made products)
    if (!toolkit) {
      try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          const product = await Product.findOne({ _id: id, userId: user.userId });
          if (product) {
            toolkit = await Toolkit.create({
              userId: user.userId,
              productId: product._id,
              reviewQuestions: [
                "How would you describe the overall build quality of this product?",
                "Which specific feature stood out to you the most during your initial use?",
                "In what scenario would you find this product most indispensable?",
                "On a scale of 1-10, how intuitive was the initial setup process?",
                "What is the one thing you would change to improve the user experience?"
              ],
              qualifierQuestions: [
                "Are you currently in the market for a solution of this type?",
                "Who else would you recommend this product to?"
              ],
              scoringCriteria: "Composite score based on verbal sentiment and behavioral engagement metrics."
            });
            toolkit = await Toolkit.findById(toolkit._id).populate("productId");
          }
        }
      } catch (genErr) {
        console.error("Auto-toolkit generation failed:", genErr);
      }
    }

    if (!toolkit) return jsonResponse(false, "Toolkit not found or unauthorized", null, 404);
    
    return jsonResponse(true, "Toolkit fetched successfully", toolkit, 200);
  } catch (error) {
    console.error("[Toolkit API Error]", error);
    return jsonResponse(false, "Internal server error", null, 500);
  }
}
