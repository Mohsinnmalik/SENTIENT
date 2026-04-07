"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, StopCircle, Zap, Activity, MessageSquare, Brain, Clock, Volume2, MicOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CameraAnalyzer from "@/components/camera-analyzer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { analyzeTranscript, getSimulatedTranscript } from "@/lib/analysis";

type Phase = "idle" | "active" | "analyzing";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [toolkit, setToolkit] = useState<any>(null);
  const [qIndex, setQIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [behaviourScore, setBehaviourScore] = useState(5);
  const [behaviourEvents, setBehaviourEvents] = useState<string[]>([]);
  const [signal, setSignal] = useState("Neutral");
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const { transcript, interimTranscript, isListening, isDenied, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  useEffect(() => { setHasMounted(true); fetchData(); }, [id]);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [behaviourEvents]);
  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/session?id=${id}`);
      if (res.ok) {
        const { toolkit } = await res.json();
        setToolkit(toolkit);
      }
    } catch (e) { console.error(e); }
  };

  const addEvent = useCallback((event: string) => {
    const ts = new Date().toLocaleTimeString([], { hour12: false });
    setBehaviourEvents(prev => [...prev.slice(-9), `[${ts}] ${event}`]);
  }, []);

  const handleScoreUpdate = useCallback((score: number, sig: string) => {
    setBehaviourScore(score); setSignal(sig);
  }, []);

  const handleStart = () => {
    setPhase("active");
    startTimeRef.current = Date.now();
    setElapsed(0);
    setQIndex(0);
    setBehaviourEvents([]);
    setBehaviourScore(5);
    resetTranscript();
    startListening();
    addEvent("Interaction started — audio & behaviour tracking active.");
    toast.success("Live session started!");
  };

  const handleEnd = async () => {
    stopListening();
    setPhase("analyzing");
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalTranscript = transcript.trim() || getSimulatedTranscript();
    if (!transcript.trim()) addEvent("Mic unavailable — using simulated transcript.");

    const result = analyzeTranscript(finalTranscript, behaviourScore, behaviourEvents);

    // Store fallback in sessionStorage first
    const payload = { sessionId: id, transcript: finalTranscript, behaviourEvents, behaviourScore, interactionDuration: duration, ...result };
    sessionStorage.setItem("latest_report", JSON.stringify(payload));

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const report = await res.json();
      router.push(`/report/${report._id}`);
    } catch {
      router.push("/report/latest");
    }
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const qList: string[] = toolkit?.reviewQuestions || ["How would you describe your first impression of this product?", "Which feature stood out most?", "What would you change?"];

  if (!hasMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Live Interaction
              {phase === "active" && <><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /><span className="text-red-500 text-sm font-normal">LIVE</span></>}
            </h1>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-3">
              {id}
              {phase === "active" && <span className="text-primary flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(elapsed)}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div key={signal} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
              className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest flex items-center gap-2 ${signal.includes("High") ? "bg-primary/10 border-primary text-primary" : signal.includes("Low") ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-slate-500/10 border-slate-500 text-slate-400"}`}>
              <Zap className={`h-4 w-4 ${signal.includes("High") ? "fill-current" : ""}`} />{signal}
            </motion.div>
          </AnimatePresence>
          {phase === "idle" && <Button onClick={handleStart} className="h-11 px-6 bg-green-500 hover:bg-green-600 text-white font-bold gap-2 rounded-xl shadow-lg shadow-green-500/20"><Play className="h-4 w-4 fill-current" />Start Interaction</Button>}
          {phase === "active" && <Button onClick={handleEnd} variant="destructive" className="h-11 px-6 font-bold gap-2 rounded-xl"><StopCircle className="h-4 w-4" />End Interaction</Button>}
        </div>
      </div>

      {/* Analyzing overlay */}
      {phase === "analyzing" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[450px] space-y-6 text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black">Analyzing Interaction...</h2>
          <p className="text-muted-foreground">Processing verbal signals, behaviour patterns and generating AI report.</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {["Transcript Analysis", "Behaviour Scoring", "Intent Detection", "Generating Summary"].map((s, i) => (
              <motion.span key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}
                className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">✓ {s}</motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      {phase !== "analyzing" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT */}
          <div className="xl:col-span-7 space-y-6">
            {/* Question */}
            <Card className="border-none bg-background/40 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-primary border-primary/20">Q {qIndex + 1} / {qList.length}</Badge>
                  {phase === "active" && qIndex < qList.length - 1 && (
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setQIndex(p => p + 1); addEvent(`Moved to Q${qIndex + 2}.`); }}>Next →</Button>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={qIndex} initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -15, opacity: 0 }} className="mt-4">
                    <CardTitle className="text-2xl font-black leading-tight">"{qList[qIndex]}"</CardTitle>
                  </motion.div>
                </AnimatePresence>
              </CardHeader>
            </Card>

            {/* Transcript + Events */}
            <Card className={`border-none backdrop-blur-md ring-1 shadow-xl transition-all ${phase === "active" ? "ring-green-500/20 bg-green-500/5" : "ring-white/5 bg-black/10"}`}>
              <CardHeader className="py-3 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                  {isListening ? <><Volume2 className="h-3 w-3 text-green-500 animate-pulse" /><span className="text-green-500">Live Transcript</span></>
                    : <><MessageSquare className="h-3 w-3" />Transcript{isDenied && <span className="text-amber-500 ml-1">(Simulated)</span>}</>}
                </CardTitle>
                {phase === "active" && (
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-slate-500"}`} />
                    <span className="text-[9px] font-mono text-slate-500">{isListening ? "RECORDING" : "PAUSED"}</span>
                  </div>
                )}
              </CardHeader>
              <div className="p-4 min-h-[160px] max-h-[200px] overflow-y-auto font-mono text-[11px] text-slate-300 space-y-2">
                {phase === "idle" && (
                  <div className="h-28 flex flex-col items-center justify-center text-slate-600 gap-2">
                    <MicOff className="h-7 w-7 opacity-20" />
                    <p className="text-xs text-center">Press <strong>Start Interaction</strong> to begin voice capture.</p>
                  </div>
                )}
                {transcript && <p className="leading-relaxed text-slate-200">{transcript}</p>}
                {interimTranscript && <p className="text-slate-500 italic">{interimTranscript}...</p>}
                {isDenied && phase === "active" && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-amber-500 text-[10px]">Mic denied — demo mode active. Simulated transcript will be used for analysis.</p>
                  </div>
                )}
              </div>
              <div className="border-t border-white/5">
                <div className="px-4 py-2 bg-white/5 flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Real-time Behaviour Log</span>
                </div>
                <div className="px-4 pb-3 max-h-[120px] overflow-y-auto space-y-1">
                  {behaviourEvents.length === 0
                    ? <p className="text-[10px] text-slate-600 italic">Events appear here during interaction...</p>
                    : behaviourEvents.map((e, i) => <div key={i} className="text-[10px] font-mono text-slate-400 border-l border-primary/20 pl-2 py-0.5">{e}</div>)
                  }
                  <div ref={logEndRef} />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-5 space-y-6">
            <CameraAnalyzer onScoreUpdate={handleScoreUpdate} onEventLog={addEvent} demoMode />
            <Card className="border-none bg-background/40 backdrop-blur-md shadow-xl ring-1 ring-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Intelligence Hub</CardTitle>
                <CardDescription>Live behaviour score tracker.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1"><Activity size={10} />Behaviour Score</span>
                    <span className="font-mono text-foreground">{(behaviourScore * 10).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${behaviourScore * 10}%` }} className="h-full bg-green-500" />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Live Score</div>
                  <div className="text-5xl font-black tracking-tighter">{behaviourScore.toFixed(1)}<span className="text-sm opacity-30 font-normal">/10</span></div>
                  <div className="mt-3 h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div animate={{ width: `${behaviourScore * 10}%` }} className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
                </div>
                {phase === "active" && (
                  <Button onClick={handleEnd} variant="destructive" className="w-full gap-2 font-bold">
                    <StopCircle className="h-4 w-4" />End & Generate Report
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
