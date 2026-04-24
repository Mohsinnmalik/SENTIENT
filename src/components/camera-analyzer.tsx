"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CameraOff,
  Hand,
  Smile,
  Activity,
  Zap,
  AlertTriangle,
  Brain,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNeuralEngine } from "@/hooks/useNeuralEngine";

interface CameraAnalyzerProps {
  onScoreUpdate: (score: number, signal: string) => void;
  onEventLog: (event: string) => void;
  demoState?: "off" | "standard" | "perfect";
  transcriptLength?: number;
  sentimentValue?: number;
  showOverlay?: boolean;
}

export default function CameraAnalyzer({
  onScoreUpdate,
  onEventLog,
  transcriptLength = 0,
  sentimentValue = 0,
  showOverlay = false,
}: CameraAnalyzerProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const lastLoggedEventRef = useRef<string>("");

  const { videoRef: hookVideoRef, stats: hookStats, isReady, error: hookError } = useNeuralEngine(true);

  const viewStats = useMemo(() => {
    if (!hookStats) return null;

    let engagement: "High 🔥" | "Medium" | "Low ⚠️" = "Medium";
    if (hookStats.score > 7.5) engagement = "High 🔥";
    else if (hookStats.score < 4) engagement = "Low ⚠️";

    return {
      expression: hookStats.expressionLabel,
      interaction: hookStats.handDetected ? (hookStats.gestureLabel || "Exploring ✋") : "Watching 👁️",
      attention: hookStats.faceDetected ? "Focused 👀" : "Distracted 😶‍Gazing State",
      engagement,
      score: hookStats.score,
      faceDetected: hookStats.faceDetected,
      handDetected: hookStats.handDetected,
      box: hookStats.box,
      breakdown: hookStats.breakdown,
      confidence: hookStats.expressionConfidence,
      gesture: hookStats.gesture,
      postureState: hookStats.postureState,
    };
  }, [hookStats]);

  useEffect(() => {
    if (!hookStats) return;
    const { gesture, postureState, expression, faceDetected } = hookStats;

    if (faceDetected) {
      if (postureState === "leaning_in" && lastLoggedEventRef.current !== "leaning_in") {
        lastLoggedEventRef.current = "leaning_in";
        onEventLog("High engagement: Subject is leaning in (Physical Interest).");
      } else if (postureState === "leaning_back" && lastLoggedEventRef.current !== "leaning_back") {
        lastLoggedEventRef.current = "leaning_back";
        onEventLog("Low engagement: Subject is leaning back (Detachment detected).");
      } else if (postureState === "neutral" && 
        (lastLoggedEventRef.current === "leaning_in" || lastLoggedEventRef.current === "leaning_back")
      ) {
        lastLoggedEventRef.current = "neutral";
      }
    }

    const gestureKey = gesture ?? "none";
    if (lastLoggedEventRef.current !== `gesture_${gestureKey}`) {
      if (gesture === "thumbsUp") {
        lastLoggedEventRef.current = "gesture_thumbsUp";
        onEventLog("Strong approval signal: Thumbs up detected.");
      } else if (gesture === "thumbsDown") {
        lastLoggedEventRef.current = "gesture_thumbsDown";
        onEventLog("Rejection signal: Thumbs down detected.");
      } else if (gesture === "pointingUp") {
        lastLoggedEventRef.current = "gesture_pointingUp";
        onEventLog("Behavioral Anchor: High-intent pointing gesture detected.");
      } else if (gesture === "pinch") {
        lastLoggedEventRef.current = "gesture_pinch";
        onEventLog("Examination behavior: Subject is pinching/examining product.");
      } else if (!gesture && lastLoggedEventRef.current.startsWith("gesture_")) {
        lastLoggedEventRef.current = "neutral";
      }
    }

    if (faceDetected && (expression === "disgusted" || expression === "angry")) {
      const exprKey = `expr_${expression}`;
      if (lastLoggedEventRef.current !== exprKey) {
        lastLoggedEventRef.current = exprKey;
        onEventLog(`Negative expression detected: Subject appears ${expression}.`);
      }
    }
  }, [hookStats, onEventLog]);

  useEffect(() => {
    if (!viewStats) return;
    const { score } = viewStats;
    const sig =
      score > 7.5  ? "High Intent 🔥" :
      score > 5.0  ? "Positive Engagement" :
      score > 3.0  ? "Monitoring" :
      "Low Interest ⚠️";
    onScoreUpdate(score, sig);
  }, [viewStats?.score, onScoreUpdate]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Camera Box - Now clean as requested */}
      <Card
        className={`relative aspect-video overflow-hidden border-none bg-slate-950 ring-1 shadow-2xl transition-all duration-700 ${
          viewStats?.engagement === "High 🔥"
            ? "ring-primary/40 shadow-primary/10"
            : "ring-white/10"
        }`}
      >
        {isReady ? (
          <>
            <video
              ref={hookVideoRef}
              autoPlay
              muted
              playsInline
              onCanPlay={() => setIsVideoReady(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isReady ? "opacity-100" : "opacity-0"
              }`}
            />

            <AnimatePresence>
              {isVideoReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Subtle scanline */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-primary/30 z-10 opacity-20"
                  />

                  {viewStats?.box && (
                    <motion.div
                      layout
                      initial={false}
                      animate={{
                        left: `${viewStats.box.x}%`,
                        top: `${viewStats.box.y}%`,
                        width: `${viewStats.box.width}%`,
                        height: `${viewStats.box.height}%`,
                        borderColor: viewStats.score > 7 ? "#60a5fa" : "#3b82f6",
                      }}
                      className="absolute border-[1px] rounded-2xl z-20 pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-white/5"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary/20 backdrop-blur-md text-white text-[7px] font-black px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-tighter">
                        {viewStats.attention}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500 bg-slate-900/50 w-full h-full justify-center">
            {hookError ? <AlertTriangle className="h-10 w-10 text-amber-500/50" /> : <CameraOff className="h-12 w-12 opacity-20" />}
            <div className="text-center px-6">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400 font-mono">
                {hookError ? "Neural Link Interrupted" : "Initializing Link"}
              </p>
              {hookError && (
                <p className="text-[10px] font-medium text-amber-500/80 max-w-[200px] leading-relaxed">
                  {hookError}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Minimal Link Status Indicator */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-30">
          <div className={`h-1.5 w-1.5 rounded-full ${viewStats?.faceDetected ? "bg-green-500" : "bg-red-500"} animate-pulse shadow-[0_0_5px_currentColor]`} />
          <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Live Flow</span>
        </div>
      </Card>

      {/* 2. Neural Stats Dashboard - Moved outside as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Behavior & Emotion Cards */}
        <Card className="bg-white/[0.02] border-white/5 p-5 flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Brain size={60} className="text-primary" />
           </div>
           
           <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                 <Activity size={14} className="text-primary" /> Biometric Vitals
              </span>
              <span className={`text-[10px] font-black ${viewStats?.score && viewStats.score > 7 ? 'text-green-400' : 'text-primary'}`}>
                {viewStats?.score.toFixed(1)} / 10.0
              </span>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <MetricItem label="Mood" value={viewStats?.expression || "—"} icon={<Smile size={12} />} />
              <MetricItem label="Kinetic" value={viewStats?.interaction || "—"} icon={<Hand size={12} />} />
              <MetricItem label="Attention" value={viewStats?.attention || "—"} icon={<Zap size={12} />} />
              <MetricItem label="Intent" value={viewStats?.engagement || "—"} icon={<ChevronRight size={12} />} />
           </div>
        </Card>

        {/* Breakdown Card */}
        <Card className="bg-white/[0.02] border-white/5 p-5 flex flex-col gap-4 relative overflow-hidden group">
           <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Signal Decomposition</span>
              <div className="flex items-center gap-2">
                 <div className="h-1 w-8 bg-primary/20 rounded-full overflow-hidden">
                    <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-full bg-primary" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <GaugeMetric label="Facial Sync" value={viewStats?.breakdown.expression || 0} />
              <GaugeMetric label="Gesture Pulse" value={viewStats?.breakdown.sentiment || 0} />
              <GaugeMetric label="Posture Alignment" value={viewStats?.breakdown.presence || 0} />
           </div>
        </Card>
      </div>

      {/* 3. Global Score Progress */}
      <Card className="bg-black/20 border-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Overall Engagement Pulse</h4>
             <p className="text-xs font-bold text-slate-400">Composite logic based on all neural nodes.</p>
          </div>
          <div className="text-right">
             <div className="text-4xl font-black text-white italic tracking-tighter">{(viewStats?.score || 0).toFixed(1)}</div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
           <motion.div
             initial={{ width: 0 }}
             animate={{ width: `${(viewStats?.score || 0) * 10}%` }}
             transition={{ duration: 0.5 }}
             className={`h-full rounded-full ${
               (viewStats?.score || 0) > 7.5 ? "bg-green-500" : (viewStats?.score || 0) > 4 ? "bg-primary" : "bg-amber-500"
             } shadow-[0_0_20px_rgba(59,130,246,0.3)]`}
           />
        </div>
      </Card>
    </div>
  );
}

function MetricItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col gap-1 transition-colors hover:bg-white/[0.05]">
       <div className="flex items-center gap-2 opacity-50">
          {icon}
          <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-[11px] font-bold text-white truncate">{value}</span>
    </div>
  );
}

function GaugeMetric({ label, value }: { label: string; value: number }) {
  const normVal = Math.max(-5, Math.min(5, value));
  const percent = ((normVal + 5) / 10) * 100;

  return (
    <div className="space-y-1.5">
       <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
          <span className={`text-[10px] font-mono font-black ${value >= 0 ? "text-green-400" : "text-red-400"}`}>
             {value >= 0 ? "+" : ""}{value.toFixed(1)}
          </span>
       </div>
       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className={`h-full ${value >= 0 ? 'bg-green-500' : 'bg-red-500'} opacity-60`}
          />
       </div>
    </div>
  );
}
