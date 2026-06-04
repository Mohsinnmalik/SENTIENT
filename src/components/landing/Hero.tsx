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
    <section className="relative pt-20 pb-32 overflow-hidden border-b-3 border-black bg-[#f4efe6] text-black">
      {/* Layered background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.05]" />
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius)] bg-[#ffe600] text-black border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000000] text-xs font-black tracking-wider uppercase">
                <Zap className="h-3 w-3 fill-current" />
                AI Behaviour Intelligence
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] bg-[#ff3333] text-white border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000000] text-xs font-black tracking-wider">
                <LiveDot />
                LIVE
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] text-black font-heading"
            >
              Read Intent.{" "}
              <br className="hidden md:block" />
              <span className="inline-block mt-2 bg-[#ff007a] text-white border-3 border-black px-4 py-2 shadow-[4.5px_4.5px_0px_0px_#000000] -rotate-1 hover:rotate-0 transition-transform">
                Before They Speak.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-black/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-bold"
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
                  className="h-14 px-8 text-base gap-2 bg-[#ffe600] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000000] transition-all"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Start Analyzing
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base gap-2 bg-white text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000000] transition-all"
                >
                  View Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust chips with Figma-style multi-colors */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4"
            >
              {[
                { label: "Face Detection", icon: Eye, color: "bg-[#00f0ff] text-black" },
                { label: "Voice AI", icon: Activity, color: "bg-[#ff007a] text-white" },
                { label: "Neural Scoring", icon: Cpu, color: "bg-[#2ee59d] text-black" },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-[10px] font-black uppercase tracking-wider ${color}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Live Analysis Card ── */}
          <div className="flex-1 w-full max-w-[480px] mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[var(--radius)] border-3 border-black bg-white p-7 space-y-7 shadow-[8px_8px_0px_0px_#000000] text-black">

                {/* Card header */}
                <div className="flex items-center justify-between border-b-3 border-black pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-[var(--radius)] bg-[#ffe600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                      <Brain className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">{"Live Analysis"}</div>
                      <div className="font-black text-black text-lg leading-tight">{"UltraWatch Pro V2"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] bg-[#ff3333] text-white border-2 border-black">
                    <LiveDot />
                    <span className="text-[10px] font-black uppercase tracking-widest">{"Live"}</span>
                  </div>
                </div>

                {/* Visualizer */}
                <div className="relative aspect-video rounded-[var(--radius)] bg-white border-3 border-black flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffe600_0,transparent_70%)] opacity-20" />
                  <Activity className="h-10 w-10 text-black/10 animate-pulse" />

                  {/* Scan line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2.5px] bg-[#ffe600] border-b border-black"
                  />

                  {/* Labels */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-[var(--radius)] bg-[#2ee59d] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <span className="text-[9px] font-black uppercase">😊 Positive Reaction</span>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.8, delay: 0.6 }}
                    className="absolute bottom-3 right-3 px-2.5 py-1 rounded-[var(--radius)] bg-[#ff007a] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <span className="text-[9px] font-black uppercase">🔥 High Intent</span>
                  </motion.div>
                </div>

                {/* Score tiles */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Verbal Sentiment", val: 8.4, pct: "84%", color: "bg-[#ffe600]" },
                    { label: "Behaviour Score", val: 9.2, pct: "92%", color: "bg-[#00f0ff]" },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-[var(--radius)] bg-white border-3 border-black shadow-[3px_3px_0px_0px_#000000] space-y-3">
                      <div className="text-[9px] font-black text-black/40 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-2xl font-black text-black tabular-nums">{stat.val}</div>
                      <div className="h-3 w-full bg-gray-100 border-2 border-black rounded-sm overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: stat.pct }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                          className={`h-full ${stat.color} border-r border-black`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI conclusion */}
                <div className="p-4 rounded-[var(--radius)] bg-[#2ee59d] text-black border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1">{"AI Conclusion"}</div>
                  <div className="text-xs font-bold leading-relaxed">
                    Strong Buyer Signal detected. User exhibits high engagement and positive expression.
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-6 p-4 rounded-[var(--radius)] bg-[#ff007a] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000000]"
              >
                <div className="text-[9px] font-black uppercase tracking-widest mb-1">{"Intent Confidence"}</div>
                <div className="text-xl font-black flex items-center gap-2 tabular-nums">
                  94.2% <span className="text-[10px] font-normal italic">{"match"}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
