"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, Activity, Clock, ChevronDown,
  ChevronUp, BarChart, Home, Plus, Loader2, Zap, Target,
  CheckCircle2, AlertTriangle, ShoppingCart, Microscope,
  MessageSquare, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Browsing: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Microscope, emoji: "🔍", label: "Exploratory Visit", desc: "Early stage prospect. Consider exploratory price incentives." },
};

function AnimatedScore({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += target / 30;
      if (current >= target) { 
        setVal(target); 
        clearInterval(interval); 
      } else {
        setVal(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [target]);
  return <>{val.toFixed(1)}</>;
}

function MetricProgress({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
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

export default function PremiumReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("sentient_token") || "";
        const res = await fetch(`/api/report?id=${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
          credentials: "include",
        });
        const result = await res.json();
        if (result.success) {
          setReport(result.data);
        } else {
          setError(result.message || "Failed to load report.");
        }
      } catch {
        setError("Network error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const config = useMemo(() => {
    if (!report) return null;
    return VISITOR_CONFIG[report.visitorType] || VISITOR_CONFIG.Browsing;
  }, [report]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Synthesizing Report Matrix</p>
      </div>
    );
  }

  if (error || !report || !config) {
    return (
      <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-6" />
        <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Report Unavailable</h2>
        <p className="text-slate-500 mb-8 max-w-md">{error || "The requested link was not found in the neural cache."}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-full px-8 py-6 uppercase font-black text-[10px] tracking-widest bg-white/5 border-white/10 hover:bg-white/10">
            <Home size={14} className="mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#04060f]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button onClick={() => router.push("/dashboard")} variant="ghost" size="sm" className="rounded-full hover:bg-white/5 gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Dashboard</span>
            </Button>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Synthesis Report</span>
              <span className="text-xs font-mono text-slate-400 opacity-50">{report.sessionId.slice(0, 12)}...</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black py-1 px-3">
               CID: {report.sessionId.slice(-6).toUpperCase()}
             </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <section className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-10 md:p-14">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
               <div className="relative flex flex-col gap-8">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="space-y-2">
                       <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} text-[10px] font-black tracking-widest uppercase py-1 px-4 mb-4`}>
                         <Target className="h-3 w-3 mr-2" />
                         AI Assessment Complete
                       </Badge>
                       <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight">
                         {config.label} {config.emoji}
                       </h1>
                       <p className="text-slate-400 text-lg font-medium max-w-xl italic mt-4">
                         &quot;{report.summary}&quot;
                       </p>
                    </div>
                    <div className="flex flex-col items-end">
                       <div className="h-32 w-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center p-6 relative group/score">
                          <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full opacity-0 group-hover/score:opacity-100 transition-opacity" />
                          <div className="flex flex-col items-center">
                             <span className="text-5xl font-black text-white italic tracking-tighter">
                               <AnimatedScore target={report.overallScore} />
                             </span>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">SENTIENT INDEX</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                     <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                           <Activity className="h-4 w-4 text-primary" />
                           Interaction Fidelity
                        </h3>
                        <div className="space-y-6">
                           <MetricProgress label="Behaviour Matrix" value={report.behaviourScore} color="bg-primary" delay={0.2} />
                           <MetricProgress label="Verbal Sentiment" value={report.verbalScore} color="bg-amber-500" delay={0.4} />
                        </div>
                     </div>
                     <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-3">
                           <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                              <Target className="h-5 w-5 text-primary" />
                           </div>
                           <h4 className="font-black text-white tracking-tight uppercase text-sm">Strategic Insight</h4>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{config.desc}</p>
                     </div>
                  </div>
               </div>
            </section>

            <Card className="bg-white/[0.02] border-none ring-1 ring-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <CardHeader className="py-8 px-10 border-b border-white/5 flex flex-row items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                       <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-black text-white tracking-widest uppercase">Verbal Stream Transcript</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setTranscriptOpen(!transcriptOpen)} className="rounded-full hover:bg-white/5">
                    {transcriptOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
               </CardHeader>
               <AnimatePresence>
                 {transcriptOpen && (
                   <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                     <CardContent className="p-10 text-slate-300 leading-relaxed font-medium text-lg border-t border-white/5 bg-black/20 italic">
                        {report.transcript}
                     </CardContent>
                   </motion.div>
                 )}
               </AnimatePresence>
            </Card>

            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                     <Activity className="h-4 w-4 text-primary" />
                     Behavioural Intelligence Feed
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setEventsOpen(!eventsOpen)} className="text-[9px] font-black tracking-widest uppercase text-slate-500 hover:text-white">
                    {eventsOpen ? "Collapse Feed" : "Expand All"}
                  </Button>
               </div>

               <AnimatePresence>
                 {eventsOpen && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.behaviourEvents.map((event, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex gap-4 group transition-all hover:border-primary/20 hover:bg-white/[0.05]">
                           <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                              <Brain size={14} className="text-slate-500 group-hover:text-primary transition-colors" />
                           </div>
                           <p className="text-xs font-mono text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                             {event}
                           </p>
                        </motion.div>
                      ))}
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
             <Card className="bg-black/40 border-none ring-1 ring-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-white/5 pb-4">Signal Extraction</h3>
                   <div className="flex flex-wrap gap-2">
                      {report.keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-white/5 lowercase">
                          #{kw}
                        </Badge>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-white/5 pb-4">Session Telemetry</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <Clock size={16} className="text-slate-500" />
                           <span className="text-xs font-bold text-slate-400">Duration</span>
                        </div>
                        <span className="text-sm font-mono font-black text-white">{Math.floor(report.interactionDuration / 60)}m {report.interactionDuration % 60}s</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <BarChart size={16} className="text-slate-500" />
                           <span className="text-xs font-bold text-slate-400">Mode</span>
                        </div>
                        <span className="text-sm font-black text-primary">{report.isDemo ? "SIMULATED" : "REAL-TIME"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3">
                            <Zap size={16} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-400">Analysis Pulse</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                           <span className="text-[10px] font-black text-green-500 uppercase">Synchronized</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                   <Link href="/dashboard" className="w-full">
                      <Button className="h-14 w-full rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-2xl">
                         <CheckCircle2 className="mr-2 h-4 w-4" /> Archive Report
                      </Button>
                   </Link>
                   <Link href="/session/new" className="w-full">
                      <Button variant="outline" className="h-14 w-full rounded-2xl bg-white/5 border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 group">
                         <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> Neural Reset
                      </Button>
                   </Link>
                </div>
             </Card>

             <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-[2.5rem] border border-primary/20 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3">
                   <Microscope className="h-5 w-5 text-primary" />
                   <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">AI Verification</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                   This report was generated using the SENTIENT Behavioral Matrix v3.0 logic. Neural scores are derived from real-time biometric and verbal stream synchronization.
                </p>
                <div className="flex items-center gap-2 pt-2">
                   <Sparkles className="h-3 w-3 text-amber-500" />
                   <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Enhanced Accuracy Active</span>
                </div>
             </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
