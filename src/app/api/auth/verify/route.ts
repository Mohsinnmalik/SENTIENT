import { NextRequest } from "next/server";
import { getAuthUser, jsonResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized: Invalid or missing token", null, 401);
    }

    return jsonResponse(true, "Token valid", { user });
  } catch (error) {
    return jsonResponse(false, "Error verifying token", null, 500);
  }
}
