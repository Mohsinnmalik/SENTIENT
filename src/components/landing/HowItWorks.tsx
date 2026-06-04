"use client";

import { motion } from "framer-motion";
import { Settings2, ScanLine, BarChart3, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Settings2,
    title: "Configure Product",
    desc: "Define your product, target audience, and key review criteria. SENTIENT generates a tailored AI question toolkit in seconds.",
    color: "bg-white text-black",
    iconBg: "bg-[#ffe600] text-black",
  },
  {
    num: "02",
    icon: ScanLine,
    title: "Run Live Session",
    desc: "AI captures verbal responses, facial micro-expressions and hand gestures simultaneously — all in real-time, no setup required.",
    color: "bg-[#ffe600] text-black",
    iconBg: "bg-white text-black",
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Receive Intelligence",
    desc: "Get an instant deep-dive report: sentiment score, buyer classification, interaction timeline. act on truth, not guesswork.",
    color: "bg-[#ff007a] text-white",
    iconBg: "bg-[#00f0ff] text-black",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden border-b-3 border-black bg-[#00f0ff] text-black">
      {/* Separator line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-black" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-black text-black uppercase tracking-[0.4em]"
          >
            The Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-black font-heading"
          >
            From Setup to
            <span className="inline-block px-3 py-1 bg-[#ff007a] text-white border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000000] -rotate-1 ml-2">{" Insight"}</span>
            <br />in Three Steps.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-black/80 text-lg max-w-2xl mx-auto font-sans font-bold"
          >
            Stop guessing what your users really think. Our framework transforms raw interactions into
            actionable, data-driven intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector (desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-3 border-dashed border-black -z-10" />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className={`group relative p-8 rounded-[var(--radius)] border-3 border-black ${step.color} transition-all duration-150 shadow-[6px_6px_0px_0px_#000000] overflow-hidden`}
            >
              {/* Step number on top-right */}
              <div className="absolute top-4 right-4 text-4xl font-black tracking-tighter opacity-15 select-none font-heading">
                {step.num}
              </div>

              {/* Icon */}
              <div className={`relative z-10 h-16 w-16 rounded-[var(--radius)] border-2 border-black flex items-center justify-center mb-8 shadow-[3px_3px_0px_0px_#000000] ${step.iconBg} group-hover:scale-105 transition-transform duration-150`}>
                <step.icon className="h-8 w-8" />
              </div>

              <h3 className="relative z-10 text-2xl font-black mb-4 font-heading">
                {step.title}
              </h3>
              <p className="relative z-10 leading-relaxed font-semibold opacity-90">
                {step.desc}
              </p>

              {i < 2 && (
                <ArrowRight className="hidden md:block absolute -right-4 top-12 h-6 w-6 text-black -z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
