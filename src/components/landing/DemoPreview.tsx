"use client";

import { motion } from "framer-motion";
import { User, Brain, CheckCircle, Activity, Zap } from "lucide-react";

const SIGNALS = [
  { label: "😊 Positive Reaction", color: "text-black", bg: "bg-[#2ee59d] shadow-[2.5px_2.5px_0px_0px_#000000]", delay: 0 },
  { label: "🔥 High Intent",       color: "text-black", bg: "bg-[#ffe600] shadow-[2.5px_2.5px_0px_0px_#000000]", delay: 0.3 },
  { label: "✋ Active Engagement", color: "text-black", bg: "bg-[#00f0ff] shadow-[2.5px_2.5px_0px_0px_#000000]", delay: 0.6 },
];

const CHECKS = [
  "Real-time sentiment heat-mapping across every session",
  "Automated behavioural signal labeling & classification",
  "Dynamic purchase intent prediction from facial + voice data",
  "Instant session-to-report generation with AI summary",
];

export function DemoPreview() {
  return (
    <section className="py-24 bg-[#2ee59d] text-black border-b-3 border-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.05] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* ── Left ── */}
          <div className="flex-1 space-y-8 max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-black text-black uppercase tracking-[0.4em]"
            >
              Behaviour Engine Demo
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-black font-heading"
            >
              Seeing What the Customer{" "}
              <br />
              <span className="inline-block mt-2 bg-[#ffe600] text-black border-3 border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_#000000] -rotate-1 hover:rotate-0 transition-transform">
                Doesn&apos;t Say.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-black/85 text-lg leading-relaxed font-sans font-bold"
            >
              SENTIENT&apos;s proprietary multi-modal engine analyses micro-expressions,
              vocal intonation and interaction depth to surface a composite &quot;Truth Score&quot;
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
                  className="flex items-start gap-4 text-sm font-bold text-black font-sans"
                >
                  <div className="mt-0.5 h-6 w-6 rounded-[var(--radius)] bg-white text-black border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#000000]">
                    <CheckCircle className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <span>{item}</span>
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
              transition={{ duration: 0.5 }}
              className="relative rounded-[var(--radius)] border-3 border-black bg-[#0f0f11] shadow-[10px_10px_0px_0px_#000000] overflow-hidden"
            >
              {/* Retro Program Header Bar */}
              <div className="flex items-center justify-between border-b-3 border-black bg-[#1b1b1f] px-6 py-3 select-none">
                <div className="flex gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#ff3333] border-2 border-black" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#ffe600] border-2 border-black" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#00f0ff] border-2 border-black" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Session_Preview.exe</span>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b-3 border-black">
                  <div className="flex items-center gap-3 text-white">
                    <div className="h-11 w-11 rounded-[var(--radius)] bg-[#ffe600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{"Active Discovery"}</div>
                      <div className="font-black text-white text-lg leading-tight">{"FitnessPro App V2"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    <Activity className="h-4 w-4 animate-pulse text-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">{"Processing"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Visualizer panel */}
                  <div className="aspect-square rounded-[var(--radius)] bg-[#19191d] border-3 border-black flex flex-col relative overflow-hidden">
                    <div className="flex-1 flex items-center justify-center">
                      <Brain className="h-16 w-16 text-white/10 animate-pulse" />
                    </div>
                    {/* Scan line */}
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2.5px] bg-[#ffe600] border-b border-black"
                    />
                    {/* Signal labels */}
                    {SIGNALS.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, -4, 0] }}
                        transition={{ delay: s.delay, y: { repeat: Infinity, duration: 2.5 + i * 0.3, delay: s.delay } }}
                        className={`absolute text-[9px] font-black ${s.color} px-2.5 py-1.5 rounded-[var(--radius)] border-2 border-black ${s.bg}`}
                        style={{ top: `${20 + i * 26}%`, left: i % 2 === 0 ? "8%" : "auto", right: i % 2 !== 0 ? "8%" : "auto" }}
                      >
                        {s.label}
                      </motion.div>
                    ))}
                  </div>

                  {/* Metric cards */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-[var(--radius)] bg-[#19191d] border-3 border-black shadow-[3px_3px_0px_0px_#000000] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{"Intent Score"}</span>
                        <span className="px-2 py-0.5 rounded-[var(--radius)] border-2 border-black bg-[#2ee59d] text-[10px] font-black text-black">9.4/10</span>
                      </div>
                      <div className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                        8.4 <span className="text-xs text-white/20 font-normal">{"index"}</span>
                      </div>
                      <div className="h-3 w-full bg-black border-2 border-black rounded-sm overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "84%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2 }}
                          className="h-full bg-[#ffe600] border-r border-black"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-[var(--radius)] bg-[#19191d] border-3 border-black shadow-[3px_3px_0px_0px_#000000] space-y-2">
                      <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">{"Verbal Extract"}</div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-[var(--radius)] bg-[#ffe600] text-black border-2 border-black flex items-center justify-center text-lg font-black shrink-0 shadow-[1.5px_1.5px_0px_0px_#000000] italic leading-none">&quot;</div>
                        <div className="text-[11px] text-white/80 font-bold italic leading-relaxed">
                          &quot;The UI is very intuitive, I love the way the health metrics are presented...&quot;
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 rounded-[var(--radius)] bg-[#ff007a] text-white border-3 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{"Strong Buyer Signal"}</span>
                    </div>
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
