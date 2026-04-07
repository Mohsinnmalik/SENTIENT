import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Toolkit } from "@/models/Schema";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    
    if (id === "latest") {
       // Support 'latest' by finding the most recent toolkit
       const toolkit = await Toolkit.findOne().sort({ createdAt: -1 }).populate("productId");
       return NextResponse.json(toolkit);
    }

    const toolkit = await Toolkit.findById(id).populate("productId");
    
    if (!toolkit) {
      return NextResponse.json({ error: "Toolkit not found" }, { status: 404 });
    }
    
    return NextResponse.json(toolkit);
  } catch (error: any) {
    console.error("Error fetching toolkit:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
