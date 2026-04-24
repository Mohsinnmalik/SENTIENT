import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/models/Schema";
import { getAuthUser, jsonResponse } from "@/lib/auth";

// 1. FETCH USER PRODUCTS
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    
    // Only return products belonging to this user
    const products = await Product.find({ userId: user.userId }).sort({ createdAt: -1 });
    
    return jsonResponse(true, "Products fetched successfully", products, 200);
  } catch (error) {
    return jsonResponse(false, "Internal Error", (error as Error).message, 500);
  }
}

// 2. CREATE NEW PRODUCT
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonResponse(false, "Unauthorized", null, 401);

    await dbConnect();
    
    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type || !description) {
      return jsonResponse(false, "Name, type, and description are required", null, 400);
    }

    const existingProduct = await Product.findOne({ userId: user.userId, name });
    if (existingProduct) {
      return jsonResponse(false, "A product with this name already exists for your account.", null, 409);
    }

    const product = await Product.create({
      userId: user.userId,
      name,
      type,
      description,
      reviewFocus: body.reviewFocus || [],
      targetAudience: body.targetAudience || "",
      buyerCriteria: body.buyerCriteria || "",
      investorCriteria: body.investorCriteria || ""
    });

    return jsonResponse(true, "Product created successfully", product, 201);
  } catch (error) {
    console.error("[Product API Error]", error);
    return jsonResponse(false, "Internal server error", null, 500);
  }
}
