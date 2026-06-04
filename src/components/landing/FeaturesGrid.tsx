"use client";

import { motion } from "framer-motion";
import { Brain, Eye, Zap, Target, BarChart, Mic } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Question Engine",
    desc: "Dynamically generates contextual follow-up questions during sessions based on real-time verbal feedback.",
    color: "text-primary",
  },
  {
    icon: Eye,
    title: "Expression Detection",
    desc: "Tracks micro-expressions and facial signals in real-time using face-api.js to gauge true emotional state.",
    color: "text-secondary",
  },
  {
    icon: Mic,
    title: "Voice Sentiment",
    desc: "Captures continuous speech, transcribes it, and scores verbal sentiment using intelligent keyword analysis.",
    color: "text-accent",
  },
  {
    icon: Target,
    title: "Buyer Prediction",
    desc: "Classifies every visitor as Buyer, Interested, or Browsing using a composite verbal + behavioural model.",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "Real-Time Scoring",
    desc: "Instant multi-channel assessment of verbal and non-verbal data to calculate live engagement intensity.",
    color: "text-secondary",
  },
  {
    icon: BarChart,
    title: "Intelligent Reports",
    desc: "Every session generates a full report: scores, buyer type, AI summary, transcript and behaviour timeline.",
    color: "text-accent",
  },
];

const CARD_STYLES = [
  { bg: "bg-white text-black", iconBg: "bg-[#ffe600] text-black" },
  { bg: "bg-[#ff007a] text-white", iconBg: "bg-white text-black" },
  { bg: "bg-[#00f0ff] text-black", iconBg: "bg-[#ff007a] text-white" },
  { bg: "bg-[#f4efe6] text-black", iconBg: "bg-[#ffe600] text-black" },
  { bg: "bg-white text-black", iconBg: "bg-[#ff007a] text-white" },
  { bg: "bg-[#ff007a] text-white", iconBg: "bg-[#00f0ff] text-black" },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 relative overflow-hidden border-b-3 border-black bg-[#ffe600] text-black">
      <div className="absolute inset-0 bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.05] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-black text-black uppercase tracking-[0.4em]"
          >
            Advanced Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-black font-heading"
          >
            Intelligence at
            <span className="inline-block px-3 py-1 bg-[#ff007a] text-white border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000000] -rotate-1 ml-2"> Every Layer</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-black/80 text-lg max-w-2xl mx-auto font-sans font-bold"
          >
            Everything you need to transform product discovery from a guessing game into a scientific, repeatable process.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group p-8 rounded-[var(--radius)] border-3 border-black transition-all duration-150 shadow-[5px_5px_0px_0px_#000000] hover:shadow-[7px_7px_0px_0px_#000000] ${CARD_STYLES[i % CARD_STYLES.length].bg}`}
            >
              <div className={`h-14 w-14 rounded-[var(--radius)] border-2 border-black flex items-center justify-center mb-8 shadow-[2px_2px_0px_0px_#000000] ${CARD_STYLES[i % CARD_STYLES.length].iconBg}`}>
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 font-heading">{f.title}</h3>
              <p className="text-sm font-semibold opacity-90 leading-relaxed font-sans">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
