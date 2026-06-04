"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden border-b-3 border-black bg-[#ff007a] text-white">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.05] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-5xl text-center space-y-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius)] bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-black tracking-widest uppercase">
            <Zap className="h-3 w-3 fill-current" />
            Production Ready
          </div>

          <h2 className="text-5xl md:text-8xl font-black tracking-tight leading-none text-white font-heading">
            Turn Every<br />
            Interaction Into{" "}
            <span className="inline-block mt-2 bg-[#ffe600] text-black border-3 border-black px-6 py-2 shadow-[5px_5px_0px_0px_#000000] -rotate-1 hover:rotate-0 transition-transform">
              Insight.
            </span>
          </h2>

          <p className="text-white/95 text-xl max-w-2xl mx-auto font-black leading-relaxed font-sans">
            Join forward-thinking product teams who use SENTIENT to validate features,
            understand buyer behaviour and close more sales — in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="h-16 px-10 text-xl gap-2 bg-[#ffe600] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000000] transition-all"
            >
              Start Analyzing Now
              <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 text-lg bg-white text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000000] transition-all"
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
    <footer className="py-20 bg-[#6b21a8] text-white border-t-3 border-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.05] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-10">

          {/* Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-[var(--radius)] bg-white border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] overflow-hidden">
              <Image src="/logo.png" alt="SENTIENT Logo" width={56} height={56} className="h-full w-full object-cover" />
            </div>
            <div className="text-3xl font-black tracking-tight text-white font-heading">SENTIENT</div>
            <p className="text-white/80 max-w-sm text-sm font-semibold leading-relaxed font-sans">
              Built for intelligent product experiences and truth-driven discovery sessions.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-black uppercase tracking-widest text-white/70">
            {[
              { label: "Home",        href: "/" },
              { label: "Dashboard",   href: "/dashboard" },
              { label: "Login",       href: "/login" },
              { label: "New Product", href: "/setup" },
              { label: "Privacy",     href: "#" },
              { label: "Terms",       href: "#" },
            ].map(link => (
              <Link key={link.label} href={link.href} className="hover:text-[#ffe600] border-b-2 border-transparent hover:border-[#ffe600] transition-all">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-10 border-t-3 border-black w-full flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
            <div>© 2026 SENTIENT AI. All Rights Reserved.</div>
            <div>Designed for the Next Generation of Product Builders</div>
            <div className="flex items-center gap-5">
              {["Twitter", "LinkedIn", "Discord"].map(s => (
                <span key={s} className="hover:text-[#2ee59d] transition-colors cursor-pointer">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
