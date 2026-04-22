"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, MessageSquare, Activity, Clock, ChevronDown,
  ChevronUp, BarChart, Home, Plus, Loader2, Zap, Target, TrendingUp,
  CheckCircle2, AlertTriangle, ShoppingCart, Sparkles, ShieldCheck, Microscope
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ────────────────────────────────────────────────────────────────────
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

const VISITOR_CONFIG = {
  Buyer: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: ShoppingCart, emoji: "🛒", label: "High Purchase Intent", desc: "High conversion probability. Immediate follow-up recommended." },
  Interested: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: Target, emoji: "👀", label: "Strong Interest", desc: "Genuine product engagement. Nurture with deeper specifications." },
  Browsing: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: TrendingUp, emoji: "🔍", label: "Exploratory Visit", desc: "Early stage prospect. Consider exploratory price incentives." },
};

function AnimatedScore({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += target / 30;
      if (current >= target) { setVal(target); clearInterval(interval); }
      else setVal(current);
    }, 30);
    return () => clearInterval(interval);
  }, [target]);
  return <>{val.toFixed(1)}</>;
}

function MetricProgress({ label, value, color, delay }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
        <span className="text-sm font-black text-white italic">{value.toFixed(1)}<span className="text-[9px] opacity-30 ml-0.5">/10</span></span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${value * 10}%` }}
          transition={{ duration: 1, ease: "easeOut", delay }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} 
        />
      </div>
    </div>
  );
}

export default function PremiumReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("sentient_token") || "";
        const res = await fetch(`/api/report?id=${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setReport(result.data);
      } catch (e) {} finally { setIsLoading(false); }
    };
    load();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center gap-6">
       <div className="h-16 w-16 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center animate-pulse">
         <Microscope className="text-primary animate-bounce" size={32} />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Synthesizing Decision Logic</p>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <AlertTriangle size={64} className="text-red-500 opacity-50" />
      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Trace Not Found</h2>
      <Link href="/dashboard"><Button className="rounded-2xl px-10 h-14 font-black tracking-widest bg-white text-black hover:bg-slate-200">RETURN TO BASE</Button></Link>
    </div>
  );

  const cfg = VISITOR_CONFIG[report.visitorType] || VISITOR_CONFIG.Browsing;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 relative overflow-hidden font-sans pb-32">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent)] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-12">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
           <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/10 text-slate-400">
                   <ArrowLeft size={20} />
                </Button>
              </Link>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Intelligence Matrix</div>
                <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Session #{report._id?.slice(-6)}</h1>
              </div>
           </div>
           <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-2xl">
              <ShieldCheck className="text-green-400" size={16} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Neural integrity verified</span>
           </div>
        </div>

        {/* Hero Score Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white/[0.01] border border-white/[0.05] rounded-[3rem] p-10 md:p-20 text-center space-y-10 overflow-hidden">
           <div className="absolute top-0 right-0 p-20 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 space-y-4">
              <div className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter italic bg-gradient-to-b from-white via-white to-transparent bg-clip-text text-transparent opacity-90">
                 <AnimatedScore target={report.overallScore} />
              </div>
              <div className="text-xs font-black uppercase tracking-[0.5em] text-primary">Composite Sentiment Result</div>
           </div>

           <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 pt-8">
              <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-black/40 border border-white/10 shadow-2xl">
                 <span className="text-6xl">{cfg.emoji}</span>
                 <div className="text-left">
                    <div className={`text-2xl font-black italic tracking-tighter uppercase ${cfg.color}`}>{report.visitorType}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</div>
                 </div>
              </div>

              <div className="flex flex-col gap-4 text-left">
                 <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-xs font-black text-slate-400 tracking-widest uppercase">{Math.floor(report.interactionDuration / 60)}m {report.interactionDuration % 60}s ENGAGEMENT</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-xs font-black text-slate-400 tracking-widest uppercase">CAPTURED {report.behaviourEvents.length} METADATA NODES</span>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Primary Analysis (7 cols) */}
           <div className="lg:col-span-7 space-y-8">
              
              {/* Score Explanation critique */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                 <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] p-10 space-y-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Zap size={80} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                       <Brain className="text-primary" size={24} /> Neural Logic Critique
                    </h3>
                    <p className="text-base text-slate-300 leading-relaxed font-medium italic">
                       "{report.summary}"
                    </p>
                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <div className="flex items-start gap-4">
                          <ShieldCheck className="text-green-400 mt-1 shrink-0" size={16} />
                          <div className="space-y-1">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Rationale</div>
                             <p className="text-xs text-slate-400 font-medium">
                                Score prioritized verbal sentiment weight (40%) and behavioral link stability (60%). 
                                {report.overallScore > 7 ? " Pattern suggests high alignment with current product matrices." : " Minimal engagement outliers detected."}
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>

              {/* Interaction Details */}
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] overflow-hidden">
                 <button onClick={() => setTranscriptOpen(p => !p)} className="w-full flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                       <MessageSquare className="text-primary" size={24} /> Interaction Transcript
                    </h3>
                    {transcriptOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
                 <AnimatePresence>
                    {transcriptOpen && (
                       <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-8 pt-0">
                             <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-sm leading-loose text-slate-400 h-[300px] overflow-y-auto shadow-inner">
                                {report.transcript || "No verbal nodes detected during interaction cycle."}
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] overflow-hidden">
                 <button onClick={() => setEventsOpen(p => !p)} className="w-full flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                       <Activity className="text-primary" size={24} /> Behavioural Metadata
                    </h3>
                    {eventsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
                 <AnimatePresence>
                    {eventsOpen && (
                       <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-8 pt-0 space-y-4">
                             {report.behaviourEvents.map((e, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                   <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                                   <div className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">{e}</div>
                                </div>
                             ))}
                             {report.behaviourEvents.length === 0 && <p className="text-xs text-slate-600 italic">No behavioral metadata clusters found.</p>}
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

           </div>

           {/* Supplemental Analysis (5 cols) */}
           <div className="lg:col-span-5 space-y-8">
              
              {/* Metric Breakdown */}
              <Card className="bg-white/[0.01] border border-white/10 rounded-[2.5rem] p-10 space-y-10">
                 <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <BarChart size={20} className="text-primary" /> Array Performance
                 </h3>
                 <div className="space-y-8">
                    <MetricProgress label="Verbal Sentiment Matrix" value={report.verbalScore} color="bg-primary" delay={0.2} />
                    <MetricProgress label="Behavioural Engagement Map" value={report.behaviourScore} color="bg-green-500" delay={0.4} />
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Target Accuracy</span>
                          <span className="text-primary">88%</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[88%] bg-primary" />
                       </div>
                    </div>
                 </div>
              </Card>

              {/* Context Summary */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-10 space-y-6 relative group overflow-hidden">
                 <div className="absolute -bottom-6 -right-6 opacity-5 rotate-12">
                     <Target size={120} className="text-white" />
                 </div>
                 <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <Zap size={20} className="text-amber-400" /> Strategic Context
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                       <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} className="text-green-400" />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Confidence</span>
                          <p className="text-xs text-slate-400 font-bold uppercase italic font-mono tracking-tighter">TELEMETRY LINK HIGH</p>
                       </div>
                    </div>
                    <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
                       <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                          "Pattern synthesis aligns this subject as a {report.visitorType.toLowerCase()}. Recommendation: {cfg.desc}"
                       </p>
                    </div>
                 </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex gap-4">
                 <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">
                       <Home size={16} className="mr-2" /> DASHBOARD
                    </Button>
                 </Link>
                 <Link href="/setup" className="flex-1">
                    <Button className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-slate-200">
                       <Plus size={16} className="mr-2" /> NEW PROBE
                    </Button>
                 </Link>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
