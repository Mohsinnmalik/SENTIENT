"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
     
    setHasMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("System accessed successfully.");
        localStorage.setItem("sentient_token", data.data.token);
        localStorage.setItem("sentient_user", JSON.stringify(data.data.user));
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans flex items-center justify-center">
      {/* Background Dot grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="w-full max-w-md px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-card border-3 border-border rounded-[var(--radius)] p-8 sm:p-12 shadow-[6px_6px_0px_0px_var(--border)] relative overflow-hidden"
        >
          <div className="text-center space-y-6 mb-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius)] bg-white border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] relative group overflow-hidden">
              <Image src="/logo.png" alt="SENTIENT Logo" width={80} height={80} className="h-full w-full object-cover" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-foreground">Quantum Link</h1>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                Authorized Entry Only
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-[var(--radius)] bg-card border-3 border-border text-base font-bold text-center text-foreground placeholder:text-muted-foreground/60 focus:border-primary transition-all"
            />
             <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-[var(--radius)] bg-card border-3 border-border text-base font-bold text-center text-foreground placeholder:text-muted-foreground/60 focus:border-primary transition-all"
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 rounded-[var(--radius)] bg-[#ff007a] text-white border-3 border-border text-base font-black tracking-widest uppercase transition-all shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)]"
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    CONNECTING...
                  </motion.div>
                ) : (
                  <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    ACCESS SYSTEM
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <Link href="/signup" className="text-xs font-black text-muted-foreground hover:text-foreground transition-colors block">
              New Agent? Initialize Profile
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
