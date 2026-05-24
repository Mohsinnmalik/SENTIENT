"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let verifyPromise: Promise<any> | null = null;
let lastVerifyTime = 0;

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") {
      verifyPromise = null;
      lastVerifyTime = 0;
    }

    const checkAuth = async () => {
      const storedUser = localStorage.getItem("sentient_user");
      const isProtectedRoute = ["/dashboard", "/session", "/report", "/analytics", "/toolkit"].some(
        (route) => pathname.startsWith(route)
      );

      try {
        const now = Date.now();
        if (!verifyPromise || now - lastVerifyTime > 60000) {
          verifyPromise = fetch("/api/auth/verify", {
            credentials: "include",
          }).then(res => res.json());
          lastVerifyTime = now;
        }
        const data = await verifyPromise;

        if (data.success) {
          setUser(data.data.user);
          localStorage.setItem("sentient_user", JSON.stringify(data.data.user));
        } else {
          // Clear cache on failure so next verification attempts a fresh check
          verifyPromise = null;
          lastVerifyTime = 0;
          localStorage.removeItem("sentient_user");
          localStorage.removeItem("sentient_token"); // clean legacy localStorage token
          setUser(null);
          if (isProtectedRoute) router.push("/login");
        }
      } catch {
        verifyPromise = null;
        lastVerifyTime = 0;
        // Network failure — use cached user if available for resilience
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Corrupt localStorage — clear it and redirect
            localStorage.removeItem("sentient_user");
            if (isProtectedRoute) router.push("/login");
          }
        } else if (isProtectedRoute) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    verifyPromise = null;
    lastVerifyTime = 0;
    localStorage.removeItem("sentient_token");
    localStorage.removeItem("sentient_user");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
}
