import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET is not defined in production environment.");
    }
    return "fallback_insecure_development_secret";
  }
  return secret;
};

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  // Try to extract from HttpOnly cookie first
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("auth_token");
  
  let token = tokenCookie?.value;

  // Fallback to Authorization Header
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) return null;

  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export function jsonResponse(success: boolean, message: string, data: unknown = null, status: number = 200) {
  return NextResponse.json({ success, message, data }, { status });
}
