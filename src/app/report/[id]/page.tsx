"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, MessageSquare, Activity, Clock, ChevronDown,
  ChevronUp, BarChart, Home, Plus, Loader2, Zap, Target, TrendingUp,
  CheckCircle2, AlertTriangle, ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportData = {
  _id?: string;
  sessionId: string;
  transcript: string;
  behaviourEvents: string[];
  behaviourScore: number;
  verbalScore: number;
  overallScore: number;
  visitorType: "Buyer" | "Interested" | "Browsing";
  summary: string;
  keywords: string[];
  interactionDuration: number;
  isDemo?: boolean;
  confidenceLevel?: string;
  keySignals?: string[];
  createdAt?: string;
};

// ─── Visitor type configurations ──────────────────────────────────────────────
const VISITOR_CONFIG = {
  Buyer: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    glow: "shadow-green-500/20",
    ring: "ring-green-500/20",
    gradient: "from-green-500/20 via-transparent",
    icon: ShoppingCart,
    emoji: "🛒",
    label: "High Purchase Intent",
    desc: "This visitor is highly likely to convert. Follow up immediately with a tailored offer.",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  Interested: {
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    glow: "shadow-primary/20",
    ring: "ring-primary/20",
    gradient: "from-primary/20 via-transparent",
    icon: Target,
    emoji: "👀",
    label: "Strong Interest",
    desc: "Engaged visitor showing genuine product interest. Nurture with more info and demos.",
    badge: "bg-primary/20 text-primary border-primary/30",
  },
  Browsing: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-500/20",
    gradient: "from-amber-500/20 via-transparent",
    icon: TrendingUp,
    emoji: "🔍",
    label: "Exploratory Visit",
    desc: "Early stage visitor. Consider a follow-up demo or competitive price offer.",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
};

// ─── Animated score roll-up ───────────────────────────────────────────────────
function AnimatedScore({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 60;
    const inc = target / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setVal(v => step >= steps ? target : Math.min(target, v + inc));
      if (step >= steps) clearInterval(t);
    }, 1500 / steps);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toFixed(1)}</>;
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max, color, delay = 0 }: {
  label: string; value: number; max: number; color: string; delay?: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
        <span>{label}</span>
        <span className={`font-mono px-2 py-0.5 rounded border ${color.includes("green") ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
          {value.toFixed(1)} <span className="text-[9px] opacity-40">/ {max}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-slate-900/40 rounded-full overflow-hidden p-0.5 border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1.2, ease: "circOut", delay }}
          className={`h-full ${color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    loadReport();
  }, [id]);

  const loadReport = async () => {
    setIsLoading(true);
    // Fallback: sessionStorage
    if (id === "latest") {
      const s = sessionStorage.getItem("latest_report");
      if (s) { setReport(JSON.parse(s)); setIsLoading(false); return; }
    }
    try {
      const res = await fetch(`/api/report?id=${id}`);
      const result = await res.json();
      if (result.success) {
        setReport(result.data);
      } else {
        const s = sessionStorage.getItem("latest_report");
        if (s) setReport(JSON.parse(s));
      }
    } catch {
      const s = sessionStorage.getItem("latest_report");
      if (s) setReport(JSON.parse(s));
    } finally {
      setIsLoading(false);
    }
  };

  const fmt = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;

  if (!hasMounted) return null;

  if (isLoading && !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Retrieving intelligent report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Report Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            We couldn't locate this session report in the database or your recent history.
          </p>
        </div>
        <Link href="/dashboard"><Button className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20">Return to Dashboard</Button></Link>
      </div>
    );
  }

  const cfg = VISITOR_CONFIG[report.visitorType] || VISITOR_CONFIG.Browsing;
  const CfgIcon = cfg.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16 space-y-12">

      {/* ── Back header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Session Report</h1>
          <p className="text-xs text-muted-foreground font-mono opacity-60 uppercase tracking-widest">
            {report.sessionId}
          </p>
        </div>
      </div>

      {/* ── Hero Score Section ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl p-8 md:p-16 text-center space-y-10"
      >
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} to-transparent pointer-events-none`} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        {/* Score display */}
        <div className="relative z-10 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black">
            Composite Interaction Quotient
          </p>
          <div className="text-[100px] md:text-[140px] font-black leading-none tracking-tighter tabular-nums bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic">
            <AnimatedScore target={report.overallScore} />
            <span className="text-4xl opacity-20 font-light ml-2 uppercase italic tracking-widest">/10</span>
          </div>
          {report.isDemo && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full shadow-lg pointer-events-none">
              ⚡ Demo Data / Simulation Mode
            </div>
          )}
        </div>

        {/* Buyer type pill */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`relative z-10 inline-flex items-center gap-6 px-10 py-5 rounded-[2rem] border-2 ${cfg.bg} ${cfg.border} shadow-2xl ${cfg.glow} backdrop-blur-md`}
        >
          <span className="text-5xl">{cfg.emoji}</span>
          <div className="text-left">
            <div className={`text-2xl font-black tracking-tight ${cfg.color} uppercase`}>
              {report.visitorType}
            </div>
            <div className="text-xs font-bold text-muted-foreground tracking-widest opacity-80">{cfg.label}</div>
          </div>
        </motion.div>

        {/* Meta chips */}
        <div className="relative z-10 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-full border border-white/5 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Clock className="h-3 w-3 text-primary" />
            {fmt(report.interactionDuration)} session
          </div>
          {report.createdAt && (
            <div className="bg-white/5 px-5 py-2.5 rounded-full border border-white/5 text-[11px] font-black uppercase tracking-widest text-slate-400">
              {new Date(report.createdAt).toLocaleString()}
            </div>
          )}
          {report.keywords?.length > 0 && report.keywords.map(k => (
            <Badge key={k} className="capitalize text-[10px] font-bold px-3 py-1 bg-primary/10 text-primary border border-primary/20">
              {k}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT column */}
        <div className="space-y-8">

          {/* AI Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-none bg-gradient-to-br from-primary/20 via-background to-blue-900/10 shadow-2xl ring-1 ring-primary/20 overflow-hidden relative">
              <div className="absolute -right-12 -top-12 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  AI Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-base leading-relaxed text-foreground/90 font-medium italic">
                  "{report.summary}"
                </p>
                
                {/* Confidence & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`text-xs p-5 rounded-2xl bg-black/40 border border-white/5 text-slate-300 leading-relaxed font-medium shadow-inner flex flex-col justify-center`}>
                    <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${
                      report.confidenceLevel === "High" ? "text-green-400" :
                      report.confidenceLevel === "Low" ? "text-amber-400" : "text-primary"
                    }`}>
                      <Target className="h-3 w-3" />
                      System Confidence: {report.confidenceLevel || "Medium"}
                    </div>
                    {report.confidenceLevel === "High" ? "Rich telemetry captured." : "Limited dataset observed."}
                  </div>

                  <div className={`text-xs p-5 rounded-2xl bg-black/40 border ${cfg.border} text-slate-300 leading-relaxed font-medium shadow-inner`}>
                    <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                      <CfgIcon className="h-3 w-3" />
                      Recommended Action
                    </div>
                    {cfg.desc}
                  </div>
                </div>

                {/* Key Signals */}
                {report.keySignals && report.keySignals.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <div className={`flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400`}>
                      <Zap className="h-3 w-3 text-primary" />
                      Key Signals Detected
                    </div>
                    <ul className="space-y-3">
                      {report.keySignals.map((signal, idx) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (idx * 0.1) }}
                          key={idx} className="flex items-start gap-3 text-sm text-slate-300 font-medium"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span>{signal}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-none bg-background/40 backdrop-blur-md ring-1 ring-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                  <BarChart className="h-5 w-5 text-primary" />
                  Metric Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <ScoreBar label="Verbal Sentiment Accuracy" value={report.verbalScore} max={10} color="bg-primary" delay={0.3} />
                <ScoreBar label="Behavioural Engagement Index" value={report.behaviourScore} max={10} color="bg-green-500" delay={0.45} />

                {/* Composite */}
                <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Activity size={12} className="text-primary" />
                      Composite Score
                    </span>
                    <span className="text-3xl font-black tracking-tighter italic">
                      {report.overallScore}
                      <span className="text-sm opacity-20 font-light ml-1">/10</span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-900/50 rounded-full overflow-hidden p-0.5 shadow-inner border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${report.overallScore * 10}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                      className="h-full bg-gradient-to-r from-primary via-blue-400 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    />
                  </div>
                </div>

                {/* Signal chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {report.behaviourScore > 6 ? "High Engagement" : report.behaviourScore > 4 ? "Moderate Engagement" : "Low Engagement"}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                    <Zap className="h-3 w-3" />
                    {report.visitorType === "Buyer" ? "Buy Intent Detected" : report.visitorType === "Interested" ? "Interest Signal" : "Exploration Mode"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-8">

          {/* Transcript (collapsible) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none bg-background/40 backdrop-blur-md ring-1 ring-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="p-0">
                <button
                  onClick={() => setTranscriptOpen(p => !p)}
                  className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-white/5"
                >
                  <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Full Conversation Transcript
                  </CardTitle>
                  {transcriptOpen
                    ? <ChevronUp className="h-5 w-5 text-primary" />
                    : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
              </CardHeader>
              <AnimatePresence>
                {transcriptOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="pt-0 px-6 pb-6">
                      <div className="p-6 rounded-[1.5rem] bg-black/40 border-2 border-dashed border-white/5 leading-loose text-sm font-medium font-mono text-slate-300 shadow-inner max-h-[400px] overflow-y-auto">
                        {report.transcript ? (
                          <p className="whitespace-pre-wrap">{report.transcript}</p>
                        ) : (
                          <div className="h-32 flex flex-col items-center justify-center text-slate-600 gap-2">
                            <MessageSquare className="h-8 w-8 opacity-20" />
                            <p className="italic uppercase text-[10px] tracking-widest font-black">No verbal telemetry recorded</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Behaviour Timeline (collapsible) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none bg-background/40 backdrop-blur-md ring-1 ring-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="p-0">
                <button
                  onClick={() => setEventsOpen(p => !p)}
                  className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-white/5"
                >
                  <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                    <Activity className="h-5 w-5 text-primary" />
                    Behavioural Metadata
                    <Badge variant="outline" className="ml-1 font-mono text-[10px] border-primary/30 text-primary">
                      {report.behaviourEvents?.length || 0} events
                    </Badge>
                  </CardTitle>
                  {eventsOpen
                    ? <ChevronUp className="h-5 w-5 text-primary" />
                    : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
              </CardHeader>
              <AnimatePresence>
                {eventsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="pt-0 px-6 pb-6">
                      {report.behaviourEvents?.length > 0 ? (
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                          {report.behaviourEvents.map((e, i) => (
                            <motion.div
                              key={i}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.04 }}
                              className="text-[11px] font-mono text-slate-400 border-l border-primary/30 pl-4 py-2 hover:bg-white/5 rounded-r-lg transition-all"
                            >
                              <span className="text-primary/40 font-black mr-2 tracking-tighter">[EVENT]</span>
                              {e}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">
                            No interaction metadata captured
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Home className="h-4 w-4" />
                Workspace Home
              </Button>
            </Link>
            <Link href="/setup" className="flex-[2]">
              <Button
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                New Product Interaction
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
