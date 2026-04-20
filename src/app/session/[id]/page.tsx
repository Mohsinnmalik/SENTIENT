"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, StopCircle, Zap, Activity, MessageSquare,
  Brain, Clock, Volume2, MicOff, AlertCircle, Loader2, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CameraAnalyzer from "@/components/camera-analyzer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { analyzeTranscript, calculateSentiment } from "@/lib/analysis";

type Phase = "idle" | "active" | "analyzing";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [demoState, setDemoState] = useState<"off" | "standard" | "perfect">("off");
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
  const [sentimentValue, setSentimentValue] = useState(0);

  const {
    transcript, interimTranscript, isListening,
    isDenied, startListening, stopListening, resetTranscript
  } = useSpeechRecognition();

  // On mount: set flag and fetch session data
  useEffect(() => { setHasMounted(true); fetchData(); }, [id]);

  // Auto-scroll behaviour log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [behaviourEvents]);

  // Real-time sentiment scanner
  useEffect(() => {
    const s = calculateSentiment(transcript);
    setSentimentValue(s);
  }, [transcript]);

  // Session timer
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
      const result = await res.json();
      if (result.success) {
        setToolkit(result.data.toolkit);
      } else {
        throw new Error(result.message || "Session not found");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load session data");
    }
  };

  const addEvent = useCallback((event: string) => {
    const ts = new Date().toLocaleTimeString([], { hour12: false });
    setBehaviourEvents(prev => [...prev.slice(-9), `[${ts}] ${event}`]);
  }, []);

  const handleScoreUpdate = useCallback((score: number, sig: string) => {
    setBehaviourScore(score);
    setSignal(sig);
  }, []);

  // ── START ────────────────────────────────────────────────────────────────────
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
    toast.success("Live session started!", { description: "Camera & mic are active." });
  };

  // ── END + ANALYZE ────────────────────────────────────────────────────────────
  const handleEnd = async () => {
    stopListening();
    setPhase("analyzing");

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    let finalTranscript = transcript.trim();
    if (demoState === "perfect") {
      finalTranscript = "This is incredible! The quality is outstanding, I really love the dynamic interface and performance speed. I'm absolutely ready to buy this right now.";
      addEvent("Simulated perfect conversion transcript.");
    } else if (demoState === "standard") {
      finalTranscript = "I really like the design and the screen quality is impressive. The camera features are much better than I expected. I'm curious about the battery life. Overall I'm quite interested in this product.";
      addEvent("Simulated standard positive transcript.");
    } else if (!finalTranscript) {
      finalTranscript = "User remained silent during interaction.";
      addEvent("Mic unavailable or User Silent — No audio input detected.");
    }

    const result = analyzeTranscript(finalTranscript, behaviourScore, behaviourEvents, duration);

    const payload = {
      sessionId: id,
      transcript: finalTranscript,
      behaviourEvents,
      behaviourScore,
      interactionDuration: duration,
      isDemo: demoState !== "off",
      ...result,
    };

    // Persist to sessionStorage as fallback
    sessionStorage.setItem("latest_report", JSON.stringify(payload));

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const reportResult = await res.json();
      if (!reportResult.success) throw new Error(reportResult.message || "Save failed");
      router.push(`/report/${reportResult.data._id}`);
    } catch (e: any) {
      console.error("Report save failed, using fallback navigation:", e.message);
      router.push("/report/latest");
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const qList: string[] = toolkit?.reviewQuestions || [
    "How would you describe your first impression of this product?",
    "Which feature stood out most to you?",
    "What would you change or improve?",
    "How does this compare to alternatives you've tried?",
    "Would you recommend this to someone you know?",
  ];

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 selection:text-white">
      {/* ── Top Navigation / Toolbar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/5 gap-2 text-slate-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exit</span>
              </Button>
            </Link>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Live Session</span>
                {phase === "active" && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black py-0 px-2 animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400 opacity-50">{id.slice(0, 12)}...</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {phase === "active" && (
              <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-mono font-bold tracking-tighter text-white">{fmt(elapsed)}</span>
              </div>
            )}
            
            <div className="h-6 w-[1px] bg-white/10 mx-2" />

            {phase === "active" ? (
              <Button
                onClick={handleEnd}
                variant="destructive"
                className="h-10 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-red-500/10"
              >
                End Interaction
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="h-10 px-6 bg-green-500 hover:bg-green-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-green-500/10"
              >
                Launch Sensor
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 lg:p-10">
        
        {/* ── Analyzing Phase ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#04060f]/90 backdrop-blur-2xl px-6 text-center"
            >
              <div className="relative mb-8">
                <div className="h-32 w-32 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center backdrop-blur-md">
                   <Brain className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-4xl font-black tracking-tighter mb-4 text-white uppercase italic">Synthesizing Neural Map</h2>
              <p className="text-slate-400 max-w-md font-medium text-lg leading-relaxed">
                Aggregating behavioral signals and transcript sentiment into an actionable intelligence report.
              </p>
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full">
                {["Verbal Scan", "Emotion Logic", "Intent Match", "Score Calc"].map((s, i) => (
                  <div key={s} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2">
                     <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Neural Command Center Layout ─────────────────────────────────── */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${phase === "analyzing" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          
          {/* LEFT: PRIMARY MATRIX (Cols 1-8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {phase === "idle" ? (
              <section className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent border border-white/5 p-12 lg:p-20 text-center flex flex-col items-center gap-8">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                <div className="relative h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shadow-2xl">
                   <Brain className="h-12 w-12 text-primary" />
                   <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-4 max-w-xl">
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">READY FOR LINK?</h2>
                  <p className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed">
                    Calibration complete. The AI vision engine is primed to evaluate your responses and non-verbal cues.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                  <Button variant="ghost" size="sm" onClick={() => setDemoState("off")} className={`rounded-xl px-6 text-[10px] font-black uppercase tracking-widest ${demoState === 'off' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>Real</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDemoState("standard")} className={`rounded-xl px-6 text-[10px] font-black uppercase tracking-widest ${demoState === 'standard' ? 'bg-primary/20 text-primary' : 'text-slate-500'}`}>Standard</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDemoState("perfect")} className={`rounded-xl px-6 text-[10px] font-black uppercase tracking-widest ${demoState === 'perfect' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500'}`}>Perfect</Button>
                </div>

                <Button onClick={handleStart} size="lg" className="h-16 px-12 bg-white text-black hover:bg-slate-200 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl flex items-center gap-4 group/btn">
                  Initialize Sensor
                  <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </section>
            ) : (
              <>
                {/* Cinematic Question Matrix */}
                <section className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 lg:p-12 overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.03]">
                    <Zap className="h-64 w-64 text-primary" />
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-[0.2em] px-3 py-1">
                      MATRIX Q{qIndex + 1}
                    </Badge>
                    <div className="h-px flex-1 bg-white/5" />
                    <div className="flex gap-1">
                      {qList.map((_, i) => (
                        <div key={i} className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= qIndex ? 'bg-primary' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={qIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-3xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-10"
                    >
                      "{qList[qIndex]}"
                    </motion.h3>
                  </AnimatePresence>

                  <div className="flex items-center justify-between gap-4 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</span>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-xs font-bold text-slate-300">AWAITING INPUT</span>
                        </div>
                      </div>
                    </div>
                    {qIndex < qList.length - 1 && (
                      <Button onClick={() => setQIndex(p => p + 1)} variant="ghost" className="h-12 px-8 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                        Forward Matrix <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-fit">
                   {/* Clean Vision Monitor */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Vision Hub</span>
                          <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-[10px] font-bold text-slate-400">ACTIVE SYNC</span>
                          </div>
                      </div>
                      <CameraAnalyzer 
                        onScoreUpdate={handleScoreUpdate} 
                        onEventLog={addEvent} 
                        demoState={demoState} 
                        transcriptLength={transcript.split(' ').filter(w => w.length > 0).length}
                        sentimentValue={sentimentValue}
                        showOverlay={false} // Clean mode for session
                      />
                   </div>

                   {/* Real-time Subtitles/Transcript */}
                   <Card className="bg-white/[0.03] border-none ring-1 ring-white/5 rounded-[2rem] flex flex-col h-full overflow-hidden shadow-2xl">
                      <CardHeader className="py-5 px-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.02]">
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Verbal Stream</span>
                         <Badge variant="outline" className={`text-[9px] font-black border-green-500/20 bg-green-500/10 text-green-500 ${isListening ? 'animate-pulse' : 'opacity-30'}`}>
                            {isListening ? 'LISTENING' : 'STANDBY'}
                         </Badge>
                      </CardHeader>
                      <CardContent className="p-8 flex-1 overflow-y-auto max-h-[300px] scrollbar-hide">
                         {!transcript && !interimTranscript ? (
                           <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                              <Volume2 className="h-10 w-10 text-slate-400" />
                              <p className="text-xs font-bold uppercase tracking-widest">Awaiting verbal signal...</p>
                           </div>
                         ) : (
                           <div className="space-y-4 font-medium text-lg lg:text-xl leading-relaxed">
                              {transcript && <p className="text-white">{transcript}</p>}
                              {interimTranscript && <p className="text-slate-500 italic">{interimTranscript}...</p>}
                           </div>
                         )}
                      </CardContent>
                   </Card>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: INTELLIGENCE SIDEBAR (Cols 9-12) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Main Score & Signal */}
            <Card className="bg-gradient-to-br from-white/[0.06] to-transparent border-none ring-1 ring-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">
               <div className="absolute -top-12 -right-12 h-48 w-48 bg-primary/20 blur-[100px] rounded-full" />
               <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Intent Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{behaviourScore.toFixed(1)}</span>
                        <span className="text-sm font-bold text-slate-600">/ 10</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <Activity className={`h-6 w-6 ${behaviourScore > 7 ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                  </div>

                  <div className="h-[2px] w-full bg-white/5">
                    <motion.div 
                      layout
                      initial={{ width: 0 }}
                      animate={{ width: `${behaviourScore * 10}%` }}
                      className={`h-full ${behaviourScore > 7 ? 'bg-green-500' : 'bg-primary'} shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-700`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Signal</span>
                     <div className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest flex items-center justify-between ${
                        signal.includes("High") ? "bg-green-500/10 border-green-500/20 text-green-400" : 
                        signal.includes("Low") ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : 
                        "bg-white/5 border-white/10 text-slate-400"
                     }`}>
                        <div className="flex items-center gap-3">
                          <Zap className={`h-4 w-4 ${signal.includes("High") ? "fill-current" : ""}`} />
                          {signal}
                        </div>
                        <span className="text-[8px] opacity-40">CALIBRATED</span>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Behavioral Log Feed */}
            <Card className="bg-black/20 border-none ring-1 ring-white/5 rounded-[2rem] flex flex-col h-[400px] overflow-hidden">
               <CardHeader className="py-5 px-8 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Activity className="h-3 w-3 text-primary" />
                     Behaviour Intel Feed
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               </CardHeader>
               <CardContent className="p-6 flex-1 overflow-y-auto scrollbar-hide space-y-3">
                  {behaviourEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-20">
                       <p className="text-[10px] font-black uppercase tracking-widest">Feed Standby...</p>
                    </div>
                  ) : (
                    behaviourEvents.map((e, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i}
                        className="text-[10px] font-mono p-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 leading-relaxed"
                      >
                         <span className="text-primary/60 font-black mr-2">LOG:</span>
                         {e}
                      </motion.div>
                    ))
                  )}
                  <div ref={logEndRef} />
               </CardContent>
            </Card>

            {/* Privacy / System Status */}
            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 border-dashed space-y-4">
               <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hardware Intelligence</span>
               </div>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Your biometric data is processed locally within the neural matrix. No video content is stored during this live telemetry session.
               </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
