"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("sentient_user");
      const isProtectedRoute = ["/dashboard", "/session", "/report", "/analytics", "/toolkit"].some(
        (route) => pathname.startsWith(route)
      );

      try {
        // FIX 4: Use credentials:"include" so the HttpOnly auth_token cookie is sent automatically.
        // No manual token attachment needed.
        const res = await fetch("/api/auth/verify", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.data.user);
          localStorage.setItem("sentient_user", JSON.stringify(data.data.user));
        } else {
          // Cookie invalid/expired
          localStorage.removeItem("sentient_user");
          localStorage.removeItem("sentient_token"); // clean legacy localStorage token
          setUser(null);
          if (isProtectedRoute) router.push("/login");
        }
      } catch {
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
    localStorage.removeItem("sentient_token");
    localStorage.removeItem("sentient_user");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
}
