import { clearAuthCookie, jsonResponse } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthCookie();
    return jsonResponse(true, "Logged out successfully");
  } catch {
    return jsonResponse(false, "Error during logout", null, 500);
  }
}
