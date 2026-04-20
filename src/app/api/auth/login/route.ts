import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/Schema";
import { signToken, setAuthCookie, jsonResponse } from "@/lib/auth";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getIP(req);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.success) {
      return jsonResponse(false, rateLimit.message || "Too many requests", null, 429);
    }

    // 2. Validate Content-Type
    if (req.headers.get("content-type") !== "application/json") {
      return jsonResponse(false, "Invalid Content-Type. Expected application/json", null, 400);
    }

    // 3. Parse input
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return jsonResponse(false, "Missing credentials", null, 400);
    }

    await connectDB();

    // 4. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return jsonResponse(false, "Invalid email or password", null, 401);
    }

    // 5. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return jsonResponse(false, "Invalid email or password", null, 401);
    }

    // 6. Generate JWT & Set Cookie
    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    // 7. Return safe response
    return jsonResponse(true, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token, // useful for clients bridging API/cookie support
    });

  } catch (error: any) {
    console.error("Login error:", error);
    return jsonResponse(false, "Internal server error", null, 500);
  }
}
