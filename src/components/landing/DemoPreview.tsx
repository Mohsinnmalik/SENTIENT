"use client";

import { motion } from "framer-motion";
import { User, Brain, CheckCircle, Activity, Zap } from "lucide-react";

const SIGNALS = [
  { label: "😊 Positive Reaction", color: "text-green-400", bg: "bg-green-500/15 border-green-500/30", delay: 0 },
  { label: "🔥 High Intent",       color: "text-primary",    bg: "bg-primary/15 border-primary/30",    delay: 0.3 },
  { label: "✋ Active Engagement", color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30", delay: 0.6 },
];

const CHECKS = [
  "Real-time sentiment heat-mapping across every session",
  "Automated behavioural signal labeling & classification",
  "Dynamic purchase intent prediction from facial + voice data",
  "Instant session-to-report generation with AI summary",
];

export function DemoPreview() {
  return (
    <section className="py-32 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(59,130,246,0.04),transparent)] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* ── Left ── */}
          <div className="flex-1 space-y-8 max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-black text-primary uppercase tracking-[0.4em]"
            >
              Behaviour Engine Demo
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            >
              Seeing What the Customer{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400 italic">
                Doesn't Say.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg leading-relaxed"
            >
              SENTIENT's proprietary multi-modal engine analyses micro-expressions,
              vocal intonation and interaction depth to surface a composite "Truth Score"
              that goes far beyond verbal feedback alone.
            </motion.p>

            <ul className="space-y-4 pt-2">
              {CHECKS.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-sm font-medium text-slate-300"
                >
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* ── Right: Mock Session UI ── */}
          <div className="flex-1 w-full max-w-[500px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative p-6 rounded-[2.5rem] border border-white/10 bg-[#080c14]/90 backdrop-blur-3xl shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5" />

              {/* Header */}
              <div className="flex items-center justify-between mb-7 pb-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center p-0.5">
                    <div className="h-full w-full bg-[#080c14] rounded-[0.8rem] flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Discovery</div>
                    <div className="text-xl font-black text-white">FitnessPro App V2</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Activity className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Processing</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                {/* Visualizer panel */}
                <div className="aspect-square rounded-2xl bg-black/40 border border-white/5 flex flex-col relative overflow-hidden">
                  <div className="flex-1 flex items-center justify-center">
                    <Brain className="h-16 w-16 text-primary/15 animate-pulse" />
                  </div>
                  {/* Scan line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                  />
                  {/* Signal labels */}
                  {SIGNALS.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: [0, -5, 0] }}
                      transition={{ delay: s.delay, y: { repeat: Infinity, duration: 2.5 + i * 0.3, delay: s.delay } }}
                      className={`absolute text-[10px] font-black ${s.color} px-2.5 py-1.5 rounded-xl ${s.bg} border backdrop-blur-xl`}
                      style={{ top: `${20 + i * 28}%`, left: i % 2 === 0 ? "8%" : "auto", right: i % 2 !== 0 ? "8%" : "auto" }}
                    >
                      {s.label}
                    </motion.div>
                  ))}
                </div>

                {/* Metric cards */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">Intent Score</span>
                      <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-[10px] font-bold text-green-400">9.4/10</span>
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter tabular-nums">
                      8.4 <span className="text-xs text-white/20 font-normal">index</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "84%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="text-[9px] font-black text-white/25 uppercase tracking-widest">Verbal Extract</div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary italic shrink-0">"</div>
                      <div className="text-xs text-white/60 italic leading-relaxed">
                        "The UI is very intuitive, I love the way the health metrics are presented..."
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-primary fill-current" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Strong Buyer Signal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
