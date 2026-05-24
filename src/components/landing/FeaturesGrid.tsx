"use client";

import { motion } from "framer-motion";
import { Brain, Eye, Zap, Target, BarChart, Mic } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Question Engine",
    desc: "Dynamically generates contextual follow-up questions during sessions based on real-time verbal feedback.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "hover:border-blue-500/20 hover:shadow-blue-500/10",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    icon: Eye,
    title: "Expression Detection",
    desc: "Tracks micro-expressions and facial signals in real-time using face-api.js to gauge true emotional state.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "hover:border-primary/20 hover:shadow-primary/10",
    glow: "group-hover:shadow-primary/20",
  },
  {
    icon: Mic,
    title: "Voice Sentiment",
    desc: "Captures continuous speech, transcribes it, and scores verbal sentiment using intelligent keyword analysis.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "hover:border-violet-500/20",
    glow: "",
  },
  {
    icon: Target,
    title: "Buyer Prediction",
    desc: "Classifies every visitor as Buyer, Interested, or Browsing using a composite verbal + behavioural model.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "hover:border-green-500/20",
    glow: "",
  },
  {
    icon: Zap,
    title: "Real-Time Scoring",
    desc: "Instant multi-channel assessment of verbal and non-verbal data to calculate live engagement intensity.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "hover:border-amber-500/20",
    glow: "",
  },
  {
    icon: BarChart,
    title: "Intelligent Reports",
    desc: "Every session generates a full report: scores, buyer type, AI summary, transcript and behaviour timeline.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "hover:border-pink-500/20",
    glow: "",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />

      <div className="container px-4 mx-auto sm:px-8 max-w-7xl">
        <div className="text-center space-y-4 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-black text-primary uppercase tracking-[0.4em]"
          >
            Advanced Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            Intelligence at
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400"> Every Layer</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Everything you need to transform product discovery from a guessing game into a scientific, repeatable process.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className={`group p-8 rounded-[2rem] border border-white/5 ${f.border} bg-white/[0.02] backdrop-blur-3xl transition-all duration-300 shadow-xl hover:shadow-2xl`}
            >
              <div className={`h-14 w-14 rounded-2xl ${f.bg} flex items-center justify-center mb-8 ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`h-7 w-7 ${f.color}`} />
              </div>
              <h3 className={`text-xl font-black mb-3 group-hover:${f.color} transition-colors`}>{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
