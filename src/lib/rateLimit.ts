// Very basic in-memory rate limiter for auth routes
const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): { success: boolean; message?: string } {
  const now = Date.now();
  const current = rateLimits.get(ip);

  // Clean up expired entries randomly to prevent memory leak
  if (Math.random() < 0.1) {
    for (const [key, val] of rateLimits.entries()) {
      if (val.expiresAt < now) {
        rateLimits.delete(key);
      }
    }
  }

  if (current) {
    if (now > current.expiresAt) {
      // Data expired, reset
      rateLimits.set(ip, { count: 1, expiresAt: now + windowMs });
      return { success: true };
    }

    if (current.count >= limit) {
      return { success: false, message: "Too many requests, please try again later" };
    }

    current.count++;
    return { success: true };
  } else {
    rateLimits.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true };
  }
}

export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown-ip";
}
