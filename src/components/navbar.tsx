"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-black/50 border-b border-white/5 backdrop-blur-2xl px-6 py-4">
        <div className="container flex h-16 items-center justify-between mx-auto max-w-7xl" />
      </nav>
    );
  }

  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  if (isLoginPage || isSignupPage) return null;

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isLandingPage
          ? "bg-black/50 border-b border-white/5 backdrop-blur-2xl px-6 py-4"
          : "bg-[#04060f]/80 border-b border-white/5 backdrop-blur-md px-4 sm:px-8 py-4"
      )}
    >
      <div className="container flex h-16 items-center justify-between mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-primary shadow-xl shadow-primary/20 rotate-0 group-hover:rotate-12 transition-transform">
              <BrainCircuit className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              SENTIENT
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          {[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Analytics", href: "/analytics" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-black uppercase tracking-widest transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/login">
              <Button className="h-11 px-6 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10">
                System Access
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-white">{user.name}</span>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                className="h-11 px-4 text-xs font-black uppercase tracking-widest rounded-xl border-white/10 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
