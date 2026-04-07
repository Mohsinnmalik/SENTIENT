"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, MessageSquare, Activity, Clock, ChevronDown, ChevronUp, BarChart, Home, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  createdAt?: string;
};

const VISITOR_CONFIG = {
  Buyer:       { color: "text-green-400",  bg: "bg-green-500/10",    border: "border-green-500/40",  glow: "shadow-green-500/20",  emoji: "🛒", label: "High Purchase Intent",  desc: "This visitor is highly likely to convert. Follow up immediately." },
  Interested:  { color: "text-primary",    bg: "bg-primary/10",      border: "border-primary/40",    glow: "shadow-primary/20",    emoji: "👀", label: "Strong Interest",       desc: "Engaged visitor showing genuine product interest. Nurture with more info." },
  Browsing:    { color: "text-amber-400",  bg: "bg-amber-500/10",    border: "border-amber-500/40",  glow: "shadow-amber-500/20",  emoji: "🔍", label: "Exploratory Visit",     desc: "Early stage visitor. Consider a follow-up demo or price offer." },
};

function AnimatedScore({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let step = 0;
    const steps = 60;
    const inc = target / steps;
    const t = setInterval(() => {
      step++;
      setVal(v => step >= steps ? target : Math.min(target, v + inc));
      if (step >= steps) clearInterval(t);
    }, 1500 / steps);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toFixed(1)}</>;
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (id === "latest") {
      const s = sessionStorage.getItem("latest_report");
      if (s) { setReport(JSON.parse(s)); return; }
    }
    try {
      const res = await fetch(`/api/report?id=${id}`);
      if (res.ok) { setReport(await res.json()); return; }
    } catch {}
    const s = sessionStorage.getItem("latest_report");
    if (s) setReport(JSON.parse(s));
  };

  const fmt = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;

  if (!hasMounted) return null;
  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-muted-foreground">Loading report...</p>
    </div>
  );

  const cfg = VISITOR_CONFIG[report.visitorType];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-lg font-bold">Session Report</h1>
          <p className="text-xs text-muted-foreground font-mono">{report.sessionId}</p>
        </div>
      </div>

      {/* Hero Score */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Overall Intelligence Score</p>
        <div className="text-[100px] font-black leading-none tracking-tighter tabular-nums">
          <AnimatedScore target={report.overallScore} />
          <span className="text-4xl opacity-20 font-light">/10</span>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
          className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl border ${cfg.bg} ${cfg.border} shadow-xl ${cfg.glow}`}>
          <span className="text-4xl">{cfg.emoji}</span>
          <div className="text-left">
            <div className={`text-xl font-black ${cfg.color}`}>{report.visitorType}</div>
            <div className="text-xs text-muted-foreground">{cfg.label}</div>
          </div>
        </motion.div>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(report.interactionDuration)} session</span>
          {report.createdAt && <span>{new Date(report.createdAt).toLocaleString()}</span>}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          {/* AI Summary */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-blue-900/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />AI Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground/90">{report.summary}</p>
              {report.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {report.keywords.map(k => <Badge key={k} variant="secondary" className="capitalize">{k}</Badge>)}
                </div>
              )}
              <div className="text-xs p-3 rounded-xl bg-black/20 border border-white/5 text-muted-foreground italic">
                {cfg.desc}
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card className="border-none bg-background/40 backdrop-blur-md ring-1 ring-white/10 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-primary" />Score Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <ScoreBar label="Verbal Sentiment" value={report.verbalScore} max={10} color="bg-primary" />
              <ScoreBar label="Behaviour Interest" value={report.behaviourScore} max={10} color="bg-green-500" />
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Composite Score</span>
                  <span className="text-2xl font-black tracking-tighter">{report.overallScore}<span className="text-xs opacity-30">/10</span></span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${report.overallScore * 10}%` }} transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Transcript */}
          <Card className="border-none bg-background/40 backdrop-blur-md ring-1 ring-white/10 shadow-xl">
            <CardHeader>
              <button onClick={() => setTranscriptOpen(p => !p)} className="flex items-center justify-between w-full text-left">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Conversation Transcript</CardTitle>
                {transcriptOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
            </CardHeader>
            <AnimatePresence>
              {transcriptOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground font-mono bg-black/20 p-4 rounded-xl border border-white/5">
                      {report.transcript || "No transcript recorded."}
                    </p>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Behaviour Timeline */}
          <Card className="border-none bg-background/40 backdrop-blur-md ring-1 ring-white/10 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Behaviour Timeline</CardTitle></CardHeader>
            <CardContent>
              {report.behaviourEvents?.length > 0 ? (
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {report.behaviourEvents.map((e, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-400 border-l-2 border-primary/20 pl-3 py-1">{e}</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No behaviour events recorded.</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1"><Button variant="outline" className="w-full gap-2"><Home className="h-4 w-4" />Dashboard</Button></Link>
            <Link href="/setup" className="flex-1"><Button className="w-full gap-2"><Plus className="h-4 w-4" />New Product</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{value.toFixed(1)} / {max}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 1, delay: 0.3 }}
          className={`h-full ${color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
      </div>
    </div>
  );
}
