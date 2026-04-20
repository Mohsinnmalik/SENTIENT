import { NextRequest } from "next/server";
import { clearAuthCookie, jsonResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await clearAuthCookie();
    return jsonResponse(true, "Logged out successfully");
  } catch (error) {
    return jsonResponse(false, "Error during logout", null, 500);
  }
}
