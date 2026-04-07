import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { SessionReport } from "@/models/Schema";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const report = await SessionReport.create(body);
    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("[API/report] POST error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const report = await SessionReport.findById(id);
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("[API/report] GET error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
