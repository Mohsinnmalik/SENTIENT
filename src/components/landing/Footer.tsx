"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-40 relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container px-4 mx-auto sm:px-8 max-w-5xl text-center space-y-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary tracking-widest uppercase">
            <Zap className="h-3 w-3 fill-current" />
            Production Ready
          </div>

          <h2 className="text-5xl md:text-8xl font-black tracking-tight leading-none text-white">
            Turn Every<br />
            Interaction Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400 italic">
              Insight.
            </span>
          </h2>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Join forward-thinking product teams who use SENTIENT to validate features,
            understand buyer behaviour and close more sales — in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="h-20 px-14 text-2xl font-black rounded-[2rem] gap-4 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
            >
              Start Analyzing Now
              <ArrowRight className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="h-20 px-12 text-lg font-black rounded-[2rem] border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            >
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-20 bg-black/50 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_100%,rgba(59,130,246,0.04),transparent)] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-10">

          {/* Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
              <BrainCircuit className="h-7 w-7 text-primary" />
            </div>
            <div className="text-3xl font-black tracking-tight">SENTIENT</div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Built for intelligent product experiences and truth-driven discovery sessions.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-black uppercase tracking-widest text-slate-500">
            {[
              { label: "Home",        href: "/" },
              { label: "Dashboard",   href: "/dashboard" },
              { label: "Login",       href: "/login" },
              { label: "New Product", href: "/setup" },
              { label: "Privacy",     href: "#" },
              { label: "Terms",       href: "#" },
            ].map(link => (
              <Link key={link.label} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-10 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/20">
            <div>© 2026 SENTIENT AI. All Rights Reserved.</div>
            <div>Designed for the Next Generation of Product Builders</div>
            <div className="flex items-center gap-5">
              {["Twitter", "LinkedIn", "Discord"].map(s => (
                <span key={s} className="hover:text-primary/60 transition-colors cursor-pointer">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
