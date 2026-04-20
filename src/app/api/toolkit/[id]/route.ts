import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Toolkit } from "@/models/Schema";
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
    
    // Try to find by Toolkit ID matching userId
    try {
      toolkit = await Toolkit.findOne({ _id: id, userId: user.userId }).populate("productId");
    } catch {
      // Ignore
    }

    // Try to find by Product ID matching userId
    if (!toolkit) {
      try {
        toolkit = await Toolkit.findOne({ productId: id, userId: user.userId }).populate("productId");
      } catch {
        // Ignore
      }
    }

    if (!toolkit) return jsonResponse(false, "Toolkit not found or unauthorized", null, 404);
    
    return jsonResponse(true, "Toolkit fetched successfully", toolkit, 200);
  } catch (error: any) {
    return jsonResponse(false, "Internal Error", error.message, 500);
  }
}
