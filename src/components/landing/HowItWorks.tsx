"use client";

import { motion } from "framer-motion";
import { Settings2, ScanLine, BarChart3, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Settings2,
    title: "Configure Product",
    desc: "Define your product, target audience, and key review criteria. SENTIENT generates a tailored AI question toolkit in seconds.",
    color: "from-blue-500/30 to-blue-600/10",
    iconColor: "text-blue-400",
    border: "hover:border-blue-500/30",
  },
  {
    num: "02",
    icon: ScanLine,
    title: "Run Live Session",
    desc: "AI captures verbal responses, facial micro-expressions and hand gestures simultaneously — all in real-time, no setup required.",
    color: "from-primary/30 to-primary/10",
    iconColor: "text-primary",
    border: "hover:border-primary/30",
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Receive Intelligence",
    desc: "Get an instant deep-dive report: sentiment score, buyer classification, interaction timeline.  act on truth, not guesswork.",
    color: "from-indigo-500/30 to-indigo-600/10",
    iconColor: "text-indigo-400",
    border: "hover:border-indigo-500/30",
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Subtle separator line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/40 to-transparent" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="text-center space-y-4 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-black text-primary uppercase tracking-[0.4em]"
          >
            The Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            From Setup to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400"> Insight</span>
            <br />in Three Steps.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Stop guessing what your users really think. Our framework transforms raw interactions into
            actionable, data-driven intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector (desktop) */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -10 }}
              className={`group relative p-8 rounded-[2rem] border border-white/5 ${step.border} bg-white/[0.02] backdrop-blur-3xl transition-all duration-300 overflow-hidden`}
            >
              {/* Gradient bg on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]`} />

              {/* Step number */}
              <div className="relative z-10 text-[10px] font-black tracking-[0.4em] text-white/20 uppercase mb-6">
                Step {step.num}
              </div>

              {/* Icon */}
              <div className={`relative z-10 h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className={`h-8 w-8 ${step.iconColor}`} />
              </div>

              <h3 className={`relative z-10 text-2xl font-black mb-4 group-hover:${step.iconColor} transition-colors`}>
                {step.title}
              </h3>
              <p className="relative z-10 text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">
                {step.desc}
              </p>

              {i < 2 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-12 h-6 w-6 text-white/10 -z-10 group-hover:text-primary/30 transition-colors" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
