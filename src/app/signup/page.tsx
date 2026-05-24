"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
     
    setHasMounted(true);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Registration successful! Initializing systems...");
        localStorage.setItem("sentient_token", data.data.token);
        localStorage.setItem("sentient_user", JSON.stringify(data.data.user));
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Registration failed");
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
    <div className="min-h-screen bg-[#04060f] flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="w-full max-w-md px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="text-center space-y-6 mb-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/[0.03] border border-white/10 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <BrainCircuit className="h-10 w-10 text-primary relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white">New Agent Setup</h1>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                Create Secure Profile
              </p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <Input
              type="text"
              placeholder="Agent Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-2xl bg-white/[0.03] border-white/10 text-base font-bold text-center text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
            <Input
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-white/[0.03] border-white/10 text-base font-bold text-center text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
             <Input
              type="password"
              placeholder="Secure Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-white/[0.03] border-white/10 text-base font-bold text-center text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary hover:bg-indigo-600 text-white text-base font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:scale-[1.02]" 
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    REGISTERING...
                  </motion.div>
                ) : (
                  <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    INITIALIZE
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Already initialized? Connect here.
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
