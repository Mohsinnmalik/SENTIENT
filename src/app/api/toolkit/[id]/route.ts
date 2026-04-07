import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Toolkit } from "@/models/Schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    console.log("[API] Fetching toolkit with id:", id);

    if (id === "latest") {
      const toolkit = await Toolkit.findOne().sort({ createdAt: -1 }).populate("productId");
      if (!toolkit) {
        return NextResponse.json({ error: "No toolkits found" }, { status: 404 });
      }
      return NextResponse.json(toolkit);
    }

    const toolkit = await Toolkit.findById(id).populate("productId");
    
    if (!toolkit) {
      console.error("[API] Toolkit not found for id:", id);
      return NextResponse.json({ error: "Toolkit not found" }, { status: 404 });
    }
    
    return NextResponse.json(toolkit);
  } catch (error: any) {
    console.error("[API] Error fetching toolkit:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
