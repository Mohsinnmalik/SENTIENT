"use client";

import { motion } from "framer-motion";
import { Zap, Play, ArrowRight, Brain, Activity, Cpu, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Reusable pulsing dot
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative pt-24 pb-40 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[160px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[160px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* ── Left Content ── */}
          <div className="flex-1 text-center lg:text-left space-y-10 max-w-2xl">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary tracking-wider uppercase">
                <Zap className="h-3 w-3 fill-current" />
                AI Behaviour Intelligence
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-black text-red-400 tracking-wider">
                <LiveDot />
                LIVE
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08]"
            >
              Read Intent.{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">
                Before They Speak.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              SENTIENT fuses facial expression analysis, real-time voice sentiment, and
              behavioural tracking into one unified buyer-intent engine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-black rounded-2xl gap-2 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Start Analyzing
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-black rounded-2xl gap-2 border-white/10 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] hover:border-primary/30 transition-all"
                >
                  View Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center lg:justify-start gap-6 pt-4"
            >
              {[
                { label: "Face Detection", icon: Eye },
                { label: "Voice AI", icon: Activity },
                { label: "Neural Scoring", icon: Cpu },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <Icon className="h-3.5 w-3.5 text-primary/60" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Live Analysis Card ── */}
          <div className="flex-1 w-full max-w-[480px] mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotateY: -8 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-indigo-500/20 blur-[80px] -z-10 rounded-[3rem]" />

              <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080c14]/90 backdrop-blur-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/5 p-7 space-y-7">

                {/* Card header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Live Analysis</div>
                      <div className="font-bold text-white text-lg leading-tight">UltraWatch Pro V2</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <LiveDot />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Live</span>
                  </div>
                </div>

                {/* Visualizer */}
                <div className="relative aspect-video rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0,transparent_70%)]" />
                  <Activity className="h-10 w-10 text-primary/20 animate-pulse" />

                  {/* Scan line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                  />

                  {/* Labels */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="absolute top-3 left-3 px-2.5 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 backdrop-blur-xl"
                  >
                    <span className="text-[10px] font-black text-green-400">😊 Positive Reaction</span>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.8, delay: 0.6 }}
                    className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-xl"
                  >
                    <span className="text-[10px] font-black text-primary">🔥 High Intent</span>
                  </motion.div>
                </div>

                {/* Score tiles */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Verbal Sentiment", val: 8.4, pct: "84%", color: "bg-primary", glow: "shadow-primary/30" },
                    { label: "Behaviour Score", val: 9.2, pct: "92%", color: "bg-green-500", glow: "shadow-green-500/30" },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                      <div className="text-[9px] font-black text-white/25 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-2xl font-black text-white tabular-nums">{stat.val}</div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: stat.pct }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                          className={`h-full ${stat.color} rounded-full shadow-lg ${stat.glow}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI conclusion */}
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5">AI Conclusion</div>
                  <div className="text-sm font-medium text-white/80 leading-relaxed">
                    Strong Buyer Signal detected. User exhibits high engagement and positive expression.
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-6 p-4 rounded-2xl bg-[#080c14]/90 border border-white/10 backdrop-blur-xl shadow-2xl"
              >
                <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Intent Confidence</div>
                <div className="text-xl font-black text-white flex items-center gap-2 tabular-nums">
                  94.2% <span className="text-[10px] font-normal text-white/30 italic">match</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
