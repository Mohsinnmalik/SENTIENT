"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, Activity,
  Brain, Clock, Volume2, MicOff, AlertCircle, Loader2, ChevronRight,
  Mic, PauseCircle, WifiOff
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CameraAnalyzer from "@/components/camera-analyzer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { analyzeTranscript } from "@/lib/analysis";


type Phase = "idle" | "active" | "analyzing";

export default function SessionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [demoState, setDemoState] = useState<"off" | "standard" | "perfect">("off");
  const [toolkit, setToolkit] = useState<{ reviewQuestions?: string[] } | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [behaviourScore, setBehaviourScore] = useState(0); 
  const [behaviourEvents, setBehaviourEvents] = useState<string[]>([]);
  const [signal, setSignal] = useState("Neutral");
  const [elapsed, setElapsed] = useState(0);
  const [detectionQuality, setDetectionQuality] = useState<"full" | "face_only" | "no_camera" | "failed" | "waiting">("full");
  const [isEnding, setIsEnding] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const pendingWritesRef = useRef<Promise<Response>[]>([]);

  const {
    transcript, interimTranscript, isListening, status: speechStatus,
    startListening, stopListening, resetTranscript
  } = useSpeechRecognition();

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("sentient_token") || "";
      const res = await fetch(`/api/session?id=${id}`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        setToolkit(result.data.toolkit);
      } else {
        throw new Error(result.message || "Session not found");
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to load session data");
    }
  }, [id]);

  useEffect(() => { 
    setIsClient(true);
    fetchData(); 
  }, [fetchData]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [behaviourEvents]);


  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const addEvent = useCallback((event: string) => {
    const ts = new Date().toLocaleTimeString([], { hour12: false });
    setBehaviourEvents(prev => [...prev.slice(-9), `[${ts}] ${event}`]);
  }, []);

  const handleScoreUpdate = useCallback((score: number, sig: string, dq: "full" | "face_only" | "no_camera" | "failed" | "waiting" = "full") => {
    setBehaviourScore(score);
    setSignal(sig);
    setDetectionQuality(dq);
  }, []);

  const handleStart = () => {
    setPhase("active");
    startTimeRef.current = Date.now();
    setElapsed(0);
    setQIndex(0);
    setBehaviourEvents([]);
    setBehaviourScore(0);
    resetTranscript();
    startListening();
    addEvent("Neural link established. Visual and auditory synchronization complete.");
    addEvent("System status: Absolute fidelity mode active.");
    toast.success("Live session started!", { description: "Camera & mic are active." });
  };

  const handleEnd = async () => {
    if (isEnding) return;
    setIsEnding(true);
    stopListening();
    setPhase("analyzing");

    const token = localStorage.getItem("sentient_token") || "";
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ action: "ending", sessionId: id }),
    }).catch(() => {});

    await Promise.allSettled(pendingWritesRef.current);
    pendingWritesRef.current = [];

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let finalTranscript = transcript.trim();
    const hasRealSpeech = finalTranscript.length > 5;

    if (demoState === "perfect" && !hasRealSpeech) {
      finalTranscript = "This is incredible! Quality is outstanding.";
    } else if (demoState === "standard" && !hasRealSpeech) {
      finalTranscript = "I really like the design.";
    } else if (!finalTranscript) {
      finalTranscript = "User remained silent.";
    }

    const result = analyzeTranscript(finalTranscript, behaviourScore, behaviourEvents, duration, detectionQuality);

    const payload = {
      sessionId: id,
      transcript: finalTranscript,
      behaviourEvents,
      behaviourScore,
      interactionDuration: duration,
      isDemo: demoState !== "off",
      isDemoSession: demoState !== "off",
      detectionQuality,
      ...result,
    };

    sessionStorage.setItem("latest_report", JSON.stringify(payload));

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const reportResult = await res.json();
      if (!reportResult.success) throw new Error(reportResult.message || "Save failed");
      router.push(`/report/${reportResult.data._id}`);
    } catch {
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

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b-3 border-border bg-background">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exit</span>
              </Button>
            </Link>
            <div className="h-6 w-[2px] bg-border" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Live Session</span>
                {phase === "active" && (
                  <Badge className="bg-[#ff3333] text-white border-2 border-border text-[9px] font-black py-0 px-2 animate-pulse shadow-[1px_1px_0px_0px_var(--border)]">
                    LIVE
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground/80">{id.slice(0, 12)}...</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {phase === "active" && (
              <div className="bg-card px-4 py-1.5 rounded-[var(--radius)] border-2 border-border flex items-center gap-3 shadow-[2px_2px_0px_0px_var(--border)] text-foreground">
                <Clock className="h-3.5 w-3.5 text-secondary" />
                <span className="text-sm font-mono font-bold tracking-tighter">{fmt(elapsed)}</span>
              </div>
            )}
            
            {phase === "active" && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] border-2 border-border text-[10px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_0px_var(--border)] ${
                speechStatus === 'listening' ? 'bg-[#2ee59d] text-black' :
                speechStatus === 'reconnecting' ? 'bg-[#ffe600] text-black animate-pulse' :
                speechStatus === 'paused' ? 'bg-[#00f0ff] text-black' :
                'bg-card text-foreground'
              }`}>
                {speechStatus === 'listening' && <><Mic size={10} className="animate-pulse" /> LISTENING</>}
                {speechStatus === 'paused' && <><PauseCircle size={10} /> PAUSED</>}
                {speechStatus === 'reconnecting' && <><WifiOff size={10} className="animate-pulse" /> RECONNECTING</>}
                {speechStatus === 'stopped' && <><MicOff size={10} /> MIC OFF</>}
              </div>
            )}

            <div className="h-6 w-[2px] bg-border mx-2" />

            {phase === "active" ? (
              <Button
                onClick={handleEnd}
                disabled={isEnding}
                className="h-10 px-6 bg-[#ff3333] text-white border-3 border-border shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all font-black text-[10px] uppercase tracking-widest"
              >
                {isEnding ? <><Loader2 size={14} className="animate-spin mr-2" />ENDING...</> : "End Interaction"}
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="h-10 px-6 bg-[#2ee59d] text-black border-3 border-border shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all font-black text-[10px] uppercase tracking-widest"
              >
                Launch Sensor
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 lg:p-10 relative z-10">
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl px-6 text-center text-foreground"
            >
              <div className="relative mb-12">
                <div className="h-40 w-40 rounded-full border-3 border-muted border-t-primary animate-spin" />
                <div className="absolute inset-0 m-auto h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-xl ring-2 ring-border">
                   <Brain className="h-12 w-12 text-primary animate-pulse" />
                </div>
              </div>

              <div className="space-y-4 max-w-lg">
                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase italic">Neural Synthesis</h2>
                <div className="flex flex-col items-center gap-2">
                   <div className="flex items-center gap-2">
                     <Loader2 className="h-3 w-3 text-primary animate-spin" />
                     <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">
                       Mapping Behavioral Telemetry
                     </p>
                   </div>
                   <div className="h-2 w-48 bg-muted rounded-[var(--radius)] overflow-hidden mt-2 border-2 border-border">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="h-full bg-[#ffe600] border-r-2 border-border"
                      />
                   </div>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {[
                  { label: "Optical Grid", status: "Calibrated" },
                  { label: "Verbal Logic", status: "Verified" },
                  { label: "Kinetic Map", status: "Mapping..." },
                  { label: "Intent Loop", status: "Predicting" }
                ].map((s, i) => (
                  <div key={s.label} className="bg-card border-3 border-border p-6 rounded-[var(--radius)] flex flex-col items-center gap-3 relative shadow-[3px_3px_0px_0px_var(--border)]">
                     <div className={`h-2.5 w-2.5 rounded-full border border-border ${i < 2 ? 'bg-[#2ee59d]' : 'bg-[#ffe600] animate-pulse'}`} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{s.label}</span>
                     <span className="text-[9px] font-mono text-muted-foreground uppercase">{s.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${phase === "analyzing" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <div className="lg:col-span-8 space-y-8">
            {phase === "idle" ? (
              <section className="bg-card border-3 border-border p-12 lg:p-20 text-center flex flex-col items-center gap-8 rounded-[var(--radius)] shadow-[6px_6px_0px_0px_var(--border)]">
                <div className="relative h-24 w-24 rounded-[var(--radius)] bg-primary text-primary-foreground border-3 border-border flex items-center justify-center shadow-[4px_4px_0px_0px_var(--border)]">
                   <Brain className="h-12 w-12" />
                </div>
                <div className="space-y-4 max-w-xl">
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">READY FOR LINK?</h2>
                  <p className="text-muted-foreground text-lg sm:text-xl font-bold leading-relaxed">
                    Calibration complete. The AI vision engine is primed to evaluate your responses and non-verbal cues.
                  </p>
                </div>
                <div className="bg-muted p-1.5 rounded-[var(--radius)] border-2 border-border flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setDemoState("off")} className={`rounded-sm px-6 text-[10px] font-black uppercase tracking-widest ${demoState === 'off' ? 'bg-[#ff007a] text-white border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)]' : 'text-muted-foreground hover:text-foreground'}`}>Real</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDemoState("standard")} className={`rounded-sm px-6 text-[10px] font-black uppercase tracking-widest ${demoState === 'standard' ? 'bg-[#ffe600] text-black border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)]' : 'text-muted-foreground hover:text-foreground'}`}>Standard</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDemoState("perfect")} className={`rounded-sm px-6 text-[10px] font-black uppercase tracking-widest ${demoState === 'perfect' ? 'bg-[#2ee59d] text-black border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)]' : 'text-muted-foreground hover:text-foreground'}`}>Perfect</Button>
                </div>
                <Button onClick={handleStart} size="lg" className="h-16 px-12 bg-[#ffe600] text-black border-3 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_var(--border)] transition-all font-black text-xs uppercase tracking-[0.2em] rounded-[var(--radius)] flex items-center gap-4 group/btn">
                  Initialize Sensor
                  <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </section>
            ) : (
              <>
                <section className="bg-card border-3 border-border rounded-[var(--radius)] p-8 lg:p-12 overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
                  <div className="flex items-center gap-4 mb-8">
                    <Badge className="bg-[#ff007a] text-white border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)] text-[10px] font-black tracking-[0.2em] px-3 py-1">
                      MATRIX Q{qIndex + 1}
                    </Badge>
                    <div className="h-px flex-1 bg-border" />
                    <div className="flex gap-1">
                      {qList.map((_, i) => (
                        <div key={i} className={`h-1 w-6 rounded-full transition-all duration-500 border ${i <= qIndex ? 'bg-primary border-border' : 'bg-muted border-transparent'}`} />
                      ))}
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.h3
                       key={qIndex}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="text-3xl lg:text-5xl font-black text-foreground leading-[1.1] tracking-tight mb-10"
                    >
                      &quot;{qList[qIndex]}&quot;
                    </motion.h3>
                  </AnimatePresence>
                  <div className="flex items-center justify-between gap-4 pt-8 border-t-3 border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</span>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-xs font-black text-foreground">AWAITING INPUT</span>
                        </div>
                      </div>
                    </div>
                    {qIndex < qList.length - 1 && (
                      <Button onClick={() => setQIndex(p => p + 1)} variant="outline" className="h-12 px-8 text-foreground font-black text-[10px] uppercase tracking-widest gap-2">
                        Forward Matrix <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-fit">
                   <div className="space-y-4">
                      <CameraAnalyzer 
                        onScoreUpdate={handleScoreUpdate} 
                        onEventLog={addEvent} 
                        demoState={demoState} 
                        active={phase === "active"}
                      />
                   </div>

                   <div className="space-y-6 flex flex-col h-full">
                      <Card className="bg-card border-3 border-border rounded-[var(--radius)] flex flex-col flex-1 overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
                         <CardHeader className="py-6 px-8 border-b-3 border-border flex flex-row items-center justify-between bg-muted text-foreground">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verbal Link [Auditory]</span>
                            <Badge className={`text-[10px] font-black border-2 border-border bg-[#2ee59d] text-black shadow-[1px_1px_0px_0px_var(--border)] ${isListening ? 'animate-pulse' : 'opacity-50'}`}>
                               {isListening ? 'STREAMING' : 'STANDBY'}
                            </Badge>
                         </CardHeader>
                         <CardContent className="p-8 flex-1 overflow-y-auto max-h-[300px]">
                           {!transcript && !interimTranscript ? (
                             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                <Volume2 className="h-10 w-10 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-widest text-foreground">Awaiting verbal signal...</p>
                             </div>
                           ) : (
                             <div className="space-y-4 font-black text-lg lg:text-xl leading-relaxed text-foreground">
                                {transcript && <p>{transcript}</p>}
                                {interimTranscript && <p className="text-muted-foreground italic font-semibold">{interimTranscript}...</p>}
                             </div>
                           )}
                         </CardContent>
                      </Card>
                   </div>
                </div>
              </>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="bg-card border-3 border-border rounded-[var(--radius)] p-8 shadow-[4px_4px_0px_0px_var(--border)] relative overflow-hidden">
               <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Intent Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-foreground tracking-tighter tabular-nums">{behaviourScore.toFixed(1)}</span>
                        <span className="text-sm font-bold text-muted-foreground">/ 10</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-sm bg-[#ffe600] border-2 border-border flex items-center justify-center shadow-[1px_1px_0px_0px_var(--border)]">
                      <Activity className={`h-6 w-6 text-foreground`} />
                    </div>
                  </div>

                  <div className="h-3 w-full bg-muted border-2 border-border rounded-[var(--radius)] overflow-hidden">
                    <motion.div 
                      layout
                      initial={{ width: 0 }}
                      animate={{ width: `${behaviourScore * 10}%` }}
                      className={`h-full ${behaviourScore > 7 ? 'bg-[#2ee59d]' : 'bg-[#ffe600]'} border-r-2 border-border transition-all duration-700`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                     <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Neural Signal</span>
                      <div className={`px-4 py-3 rounded-[var(--radius)] border-2 border-border text-xs font-black uppercase tracking-widest flex items-center justify-between shadow-[1.5px_1.5px_0px_0px_var(--border)] ${
                        signal.includes("High") ? "bg-[#2ee59d] text-black" : 
                        signal.includes("Low") ? "bg-[#ffe600] text-black" : 
                        "bg-muted text-muted-foreground"
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

            <Card className="bg-card border-3 border-border rounded-[var(--radius)] flex flex-col h-[400px] overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
               <CardHeader className="py-5 px-8 border-b-3 border-border bg-muted flex flex-row items-center justify-between">
                  <span className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                     <Activity className="h-3 w-3" />
                     Behaviour Intel Feed
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               </CardHeader>
               <CardContent className="p-6 flex-1 overflow-y-auto scrollbar-hide space-y-3 bg-card">
                  {behaviourEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-20">
                       <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Feed Standby...</p>
                    </div>
                  ) : (
                    behaviourEvents.map((e, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`${e}-${i}`}
                        className="text-[10px] font-mono p-3 rounded-[var(--radius)] bg-card border-2 border-border text-foreground leading-relaxed shadow-[1.5px_1.5px_0px_0px_var(--border)]"
                      >
                         <span className="text-[#ff007a] font-black mr-2">LOG:</span>
                         {e}
                      </motion.div>
                    ))
                  )}
                  <div ref={logEndRef} />
               </CardContent>
            </Card>

            <div className="p-6 rounded-[var(--radius)] bg-card border-3 border-border border-dashed space-y-4 shadow-[3px_3px_0px_0px_var(--border)]">
               <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-foreground" />
                  <span className="text-[9px] font-black text-foreground uppercase tracking-widest">Hardware Intelligence</span>
               </div>
               <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                  Data processed locally. No video content is stored.
               </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
