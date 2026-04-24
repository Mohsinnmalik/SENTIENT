import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    
    // Perform a minimal DB operation to keep instance warm
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // Ping the admin DB to ensure the actual cluster is awake
    await mongoose.connection.db?.admin().command({ ping: 1 });

    return NextResponse.json({
      success: true,
      status: statusMap[dbStatus as keyof typeof statusMap],
      timestamp: new Date().toISOString(),
      message: "Neural database heartbeat stable."
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Neural database sleep detected.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
