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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-foreground">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
        <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-xs">Synthesizing Report Matrix</p>
      </div>
    );
  }

  if (error || !report || !config) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-foreground">
        <AlertTriangle className="h-12 w-12 text-destructive mb-6" />
        <h2 className="text-2xl font-black text-foreground mb-2 uppercase italic tracking-tighter">Report Unavailable</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{error || "The requested link was not found in the neural cache."}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="px-8 py-6 uppercase font-black text-[10px] tracking-widest">
            <Home size={14} className="mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans">
      {/* Background Dot grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b-3 border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm" className="text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <div className="h-6 w-[2px] bg-border" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Neural Synthesis Report</span>
              <span className="text-xs font-mono text-muted-foreground/80">{report.sessionId.slice(0, 12)}...</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-primary text-primary-foreground border-2 border-border text-[9px] font-black py-1 px-3 shadow-[1.5px_1.5px_0px_0px_var(--border)]">
               CID: {report.sessionId.slice(-6).toUpperCase()}
             </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-card border-3 border-border rounded-[var(--radius)] p-10 md:p-14 relative shadow-[6px_6px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_var(--border)] transition-all duration-150">
               <div className="relative flex flex-col gap-8">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="space-y-2">
                       <Badge variant="outline" className={`${config.color} border-2 border-border text-[10px] font-black tracking-widest uppercase py-1 px-4 mb-4 shadow-[1.5px_1.5px_0px_0px_var(--border)] bg-card`}>
                         <Target className="h-3 w-3 mr-2" />
                         AI Assessment Complete
                       </Badge>
                       <h1 className="text-4xl md:text-6xl font-black text-foreground leading-none tracking-tight">
                         {config.label} {config.emoji}
                       </h1>
                       <p className="text-muted-foreground text-lg font-bold max-w-xl italic mt-4 leading-relaxed">
                         &quot;{report.summary}&quot;
                       </p>
                    </div>
                    <div className="flex flex-col items-end">
                       <div className="h-32 w-32 rounded-[var(--radius)] bg-primary text-primary-foreground border-3 border-border flex items-center justify-center p-6 relative shadow-[4px_4px_0px_0px_var(--border)]">
                          <div className="flex flex-col items-center">
                             <span className="text-5xl font-black text-black italic tracking-tighter">
                               <AnimatedScore target={report.overallScore} />
                             </span>
                             <span className="text-[9px] font-black text-black/60 uppercase tracking-widest mt-1">SENTIENT INDEX</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t-3 border-border">
                     <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2">
                           <Activity className="h-4 w-4 text-secondary" />
                           Interaction Fidelity
                        </h3>
                        <div className="space-y-6">
                           <MetricProgress label="Behaviour Matrix" value={report.behaviourScore} color="bg-primary" delay={0.2} />
                           <MetricProgress label="Verbal Sentiment" value={report.verbalScore} color="bg-accent" delay={0.4} />
                        </div>
                     </div>
                     <div className="bg-card border-3 border-border rounded-[var(--radius)] p-6 flex flex-col justify-center shadow-[4px_4px_0px_0px_var(--border)]">
                        <div className="flex items-center gap-4 mb-3">
                           <div className="h-10 w-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)]">
                              <Target className="h-5 w-5" />
                           </div>
                           <h4 className="font-black text-foreground tracking-tight uppercase text-sm">Strategic Insight</h4>
                        </div>
                        <p className="text-muted-foreground text-sm font-bold leading-relaxed">{config.desc}</p>
                     </div>
                  </div>
               </div>
            </section>

            <Card className="bg-card border-3 border-border rounded-[var(--radius)] overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
               <CardHeader className="py-8 px-10 bg-primary border-b-3 border-border flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4 text-primary-foreground">
                    <div className="h-10 w-10 rounded-sm bg-card border-2 border-border flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_var(--border)]">
                       <MessageSquare className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-lg font-black tracking-widest uppercase">Verbal Stream Transcript</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTranscriptOpen(!transcriptOpen)} className="bg-card text-foreground border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)]">
                    {transcriptOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
               </CardHeader>
               <AnimatePresence>
                 {transcriptOpen && (
                   <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                     <CardContent className="p-10 text-foreground leading-relaxed font-bold text-lg bg-card italic">
                        {report.transcript}
                     </CardContent>
                   </motion.div>
                 )}
               </AnimatePresence>
            </Card>

            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2">
                     <Activity className="h-4 w-4 text-[#ff007a]" />
                     Behavioural Intelligence Feed
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setEventsOpen(!eventsOpen)} className="text-[9px] font-black tracking-widest uppercase text-foreground">
                    {eventsOpen ? "Collapse Feed" : "Expand All"}
                  </Button>
               </div>

               <AnimatePresence>
                 {eventsOpen && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.behaviourEvents.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 text-center py-6 border-3 border-border border-dashed rounded-[var(--radius)] bg-card shadow-[2px_2px_0px_0px_var(--border)]">
                           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No behaviour events recorded.</p>
                        </div>
                      ) : (
                        report.behaviourEvents.map((event: string, i: number) => (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="bg-card border-3 border-border p-5 rounded-[var(--radius)] flex gap-4 hover:bg-muted transition-all shadow-[2.5px_2.5px_0px_0px_var(--border)]">
                             <div className="h-8 w-8 rounded-sm bg-accent text-accent-foreground flex items-center justify-center border-2 border-border shrink-0 shadow-[1px_1px_0px_0px_var(--border)]">
                                <Brain size={14} className="text-accent-foreground" />
                             </div>
                             <p className="text-xs font-bold text-foreground transition-colors leading-relaxed">
                               {event}
                             </p>
                          </motion.div>
                        ))
                      )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
             <Card className="bg-card border-3 border-border rounded-[var(--radius)] p-8 space-y-8 shadow-[4px_4px_0px_0px_var(--border)]">
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b-3 border-border pb-4">Signal Extraction</h3>
                   <div className="flex flex-wrap gap-2">
                      {report.keywords.map((kw, i) => (
                        <Badge key={i} className="bg-primary text-primary-foreground font-black px-3 py-1.5 rounded-[var(--radius)] border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)] lowercase">
                          #{kw}
                        </Badge>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b-3 border-border pb-4">Session Telemetry</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center bg-card p-4 rounded-[var(--radius)] border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                        <div className="flex items-center gap-3">
                           <Clock size={16} className="text-muted-foreground" />
                           <span className="text-xs font-bold text-muted-foreground">Duration</span>
                        </div>
                        <span className="text-sm font-mono font-black text-foreground">{Math.floor(report.interactionDuration / 60)}m {report.interactionDuration % 60}s</span>
                      </div>
                      <div className="flex justify-between items-center bg-card p-4 rounded-[var(--radius)] border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                        <div className="flex items-center gap-3">
                           <BarChart size={16} className="text-muted-foreground" />
                           <span className="text-xs font-bold text-muted-foreground">Mode</span>
                        </div>
                        <span className="text-sm font-black text-[#ff007a]">{report.isDemo ? "SIMULATED" : "REAL-TIME"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-card p-4 rounded-[var(--radius)] border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                         <div className="flex items-center gap-3">
                            <Zap size={16} className="text-muted-foreground" />
                            <span className="text-xs font-bold text-muted-foreground">Analysis Pulse</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                           <span className="text-[10px] font-black text-foreground uppercase">Synchronized</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t-3 border-border flex flex-col gap-4">
                   <Link href="/dashboard" className="w-full">
                      <Button className="h-14 w-full bg-[#ffe600] text-black border-3 border-border shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)] font-black uppercase text-[10px] tracking-widest">
                         <CheckCircle2 className="mr-2 h-4 w-4" /> Archive Report
                      </Button>
                   </Link>
                   <Link href="/dashboard" className="w-full">
                      <Button variant="outline" className="h-14 w-full text-foreground font-black uppercase text-[10px] tracking-widest">
                         <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> Neural Reset
                      </Button>
                   </Link>
                </div>
             </Card>

             <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 space-y-4 shadow-[4px_4px_0px_0px_var(--border)]">
                <div className="flex items-center gap-3">
                   <Microscope className="h-5 w-5 text-[#ff007a]" />
                   <h3 className="text-[10px] font-black text-[#ff007a] uppercase tracking-[0.3em]">AI Verification</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                   This report was generated using the SENTIENT Behavioral Matrix v3.0 logic. Neural scores are derived from real-time biometric and verbal stream synchronization.
                </p>
                <div className="flex items-center gap-2 pt-2">
                   <Sparkles className="h-3 w-3 text-[#2ee59d]" />
                   <span className="text-[9px] font-black text-[#2ee59d] uppercase tracking-widest">Enhanced Accuracy Active</span>
                 </div>
              </div>
           </aside>
        </div>
      </main>
    </div>
  );
}
