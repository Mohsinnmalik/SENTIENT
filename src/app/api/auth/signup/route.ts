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

    // 3. Parse and sanitize input
    const body = await req.json();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!name || !email || !password) {
      return jsonResponse(false, "Missing required fields", null, 400);
    }

    // 4. Password Validation (min 6-8 chars, letters and numbers)
    if (password.length < 6) {
      return jsonResponse(false, "Password must be at least 6 characters long", null, 400);
    }
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (!hasLetters || !hasNumbers) {
      return jsonResponse(false, "Password must include both letters and numbers", null, 400);
    }

    await connectDB();

    // 5. Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonResponse(false, "Email is already registered", null, 409);
    }

    // 6. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 8. Generate JWT & Set Cookie
    const tokenPayload = { userId: newUser._id.toString(), email: newUser.email };
    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    // 9. Return safe response
    return jsonResponse(true, "Registration successful", {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      token, // provided for clients not utilizing cookies
    }, 201);

  } catch (error: any) {
    console.error("Signup error:", error);
    return jsonResponse(false, "Internal server error", null, 500);
  }
}
