"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
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
      <nav className="sticky top-0 z-50 w-full bg-background border-b-3 border-border px-6 py-4">
        <div className="container flex h-16 items-center justify-between mx-auto max-w-7xl" />
      </nav>
    );
  }

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  if (isLoginPage || isSignupPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b-3 border-border px-4 sm:px-8 py-3 transition-all">
      <div className="container flex h-16 items-center justify-between mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius)] bg-white border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3.5px_3.5px_0px_0px_var(--border)] transition-all overflow-hidden">
              <Image src="/logo.png" alt="SENTIENT Logo" width={44} height={44} className="h-full w-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">
              SENTIENT
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-6">
          {[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Analytics", href: "/analytics" },
          ].map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-[var(--radius)] border-2 transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground border-border shadow-[3px_3px_0px_0px_var(--border)]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/login">
              <Button size="sm" className="h-10 px-5">
                System Access
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-[var(--radius)] bg-accent text-accent-foreground border-2 border-border shadow-[2.5px_2.5px_0px_0px_var(--border)] font-bold text-xs">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
                className="h-10 px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{"Logout"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
