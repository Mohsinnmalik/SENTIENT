import { NextRequest } from "next/server";
import { getAuthUser, jsonResponse } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/models/Schema";

export async function GET(req: NextRequest) {
  try {
    const tokenPayload = await getAuthUser(req);
    if (!tokenPayload) {
      return jsonResponse(false, "Unauthorized: Invalid or missing token", null, 401);
    }

    await dbConnect();
    const user = await User.findById(tokenPayload.userId);
    
    if (!user) {
      return jsonResponse(false, "Unauthorized: User not found", null, 401);
    }

    return jsonResponse(true, "Token valid", { 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch {
    return jsonResponse(false, "Error verifying token", null, 500);
  }
}
