import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/models/Schema";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    
    const product = await Product.create(data);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
