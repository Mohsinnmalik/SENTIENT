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
      const token = localStorage.getItem("sentient_token");
      const storedUser = localStorage.getItem("sentient_user");

      const isProtectedRoute = ["/dashboard", "/session", "/report", "/analytics"].some(route => pathname.startsWith(route));

      if (!token) {
        if (isProtectedRoute) {
          router.push("/login");
        }
        setLoading(false);
        return;
      }

      // We have a token, optionally ping backend (we only do it if we don't have local cache or sometimes for strict safety)
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // Validate with backend
        try {
          const res = await fetch("/api/auth/verify", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data.user);
            localStorage.setItem("sentient_user", JSON.stringify(data.data.user));
          } else {
            // Invalid token
            localStorage.removeItem("sentient_token");
            localStorage.removeItem("sentient_user");
            if (isProtectedRoute) router.push("/login");
          }
        } catch {
          if (isProtectedRoute) router.push("/login");
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {} // ignore
    localStorage.removeItem("sentient_token");
    localStorage.removeItem("sentient_user");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
}
