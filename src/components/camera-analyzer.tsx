"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CameraOff,
  Brain,
  Hand,
  Smile,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNeuralEngine } from "@/hooks/useNeuralEngine";
import * as faceapi from "face-api.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CameraAnalyzerProps {
  onScoreUpdate: (score: number, signal: string) => void;
  onEventLog: (event: string) => void;
  demoState?: "off" | "standard" | "perfect";
  transcriptLength?: number;
  sentimentValue?: number;
  showOverlay?: boolean;
}

interface AnalysisStats {
  expression: string;
  interaction: string;
  attention: string;
  engagement: "High 🔥" | "Medium" | "Low ⚠️" | "No Data";
  score: number;
  faceDetected: boolean;
  handDetected: boolean;
  breakdown: {
    expression: number;
    sentiment: number;
    presence: number;
  };
  box: { x: number; y: number; width: number; height: number } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CameraAnalyzer({
  onScoreUpdate,
  onEventLog,
  demoState = "off",
  transcriptLength = 0,
  sentimentValue = 0,
  showOverlay = false,
}: CameraAnalyzerProps) {
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Component state ───────────────────────────────────────────────────────
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const [stats, setStats] = useState<AnalysisStats>({
    expression: "Neutral 😐",
    interaction: "Idle ✋",
    attention: "Focused 👀",
    engagement: "No Data",
    score: 0,
    faceDetected: false,
    handDetected: false,
    breakdown: { expression: 0, sentiment: 0, presence: 0 },
    box: null,
  });

  // Use the shared neural engine
  const { videoRef: hookVideoRef, stats: hookStats, isReady, error: hookError } = useNeuralEngine(true);
  
  // Sync refs
  useEffect(() => {
    if (hookStats) {
      setStats(prev => {
        let engagement: "High 🔥" | "Medium" | "Low ⚠️" = "Medium";
        if (hookStats.score > 7) engagement = "High 🔥";
        else if (hookStats.score < 4) engagement = "Low ⚠️";
        
        return {
          ...prev,
          expression: hookStats.expression + " " + (hookStats.expression === 'happy' ? '😊' : hookStats.expression === 'surprised' ? '😲' : hookStats.expression === 'sad' ? '😟' : '😐'),
          interaction: hookStats.handDetected ? "Exploring ✋" : "Watching 👁️",
          attention: hookStats.faceDetected ? "Focused 👀" : "Distracted 😶‍🌫️",
          engagement,
          score: hookStats.score,
          faceDetected: hookStats.faceDetected,
          handDetected: hookStats.handDetected,
          box: hookStats.box,
          breakdown: {
            expression: hookStats.breakdown.expression,
            sentiment: prev.breakdown.sentiment,
            presence: hookStats.breakdown.presence
          }
        };
      });
    }
  }, [hookStats]);

  useEffect(() => {
    setHasMounted(true);
    setIsModelLoading(!isReady);
    if (hookError) setError(hookError);
  }, [isReady, hookError]);

  // ─── Effect : Parent score sync ──────────────────────────────────────────
  useEffect(() => {
    const sig =
      stats.score > 7
        ? "High Intent 🔥"
        : stats.score > 4.5
        ? "Positive Engagement"
        : "Low Interest ⚠️";
    onScoreUpdate(stats.score, sig);
  }, [stats.score]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCanPlay = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const runSimulation = () => {
    if (demoState === "perfect") {
      setStats(prev => ({
        ...prev,
        expression: "Happy 😊",
        interaction: "Active ✋",
        attention: "Focused 👀",
        engagement: "High 🔥",
        score: 8.5 + (Math.random() * 1.5),
        faceDetected: true,
        handDetected: true,
        breakdown: { ...prev.breakdown, expression: 2.0, presence: 1.0 },
        box: { x: 25, y: 25, width: 50, height: 50 }
      }));
      return;
    }

    const expressions = ["Happy 😊", "Focused 😐", "Intrigued 🤔", "Neutral 😐"];
    const interactions = ["Active ✋", "Exploring 🔍", "Watching 👁️", "Idle ✋"];

    const newExpression = expressions[Math.floor(Math.random() * expressions.length)];
    const newInteraction = interactions[Math.floor(Math.random() * interactions.length)];

    setStats((prev) => {
      let scoreChange = 0;
      if (newExpression.includes("Happy")) scoreChange += 0.5;
      if (newInteraction.includes("Active")) scoreChange += 0.5;

      const newScore = Math.min(9.5, Math.max(7.0, prev.score + scoreChange - 0.1));
      return {
        ...prev,
        expression: newExpression,
        interaction: newInteraction,
        engagement: newScore > 6 ? "High 🔥" : newScore > 4 ? "Medium" : "Low ⚠️",
        score: newScore,
        faceDetected: true,
        handDetected: newInteraction.includes("Active"),
        breakdown: { ...prev.breakdown, expression: 0.5, presence: 1.0 },
        box: { x: 30, y: 20, width: 40, height: 50 }
      };
    });
  };

  useEffect(() => {
    if (demoState !== "off") {
      loopRef.current = setInterval(runSimulation, 2000);
    }
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [demoState]);

  if (!hasMounted) return null;

  return (
    <Card
      className={`overflow-hidden border-none bg-black/5 backdrop-blur-md ring-1 shadow-2xl transition-all duration-700 ${
        stats.engagement === "High 🔥"
          ? "ring-primary/40 shadow-primary/10"
          : "ring-white/10"
      }`}
    >
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {isReady ? (
          <>
            <video
              ref={hookVideoRef}
              autoPlay
              muted
              playsInline
              onCanPlay={handleCanPlay}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isReady ? "opacity-100" : "opacity-0"
              }`}
            />

            <AnimatePresence>
              {isVideoReady && !isModelLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)] opacity-50"
                  />

                  <motion.div
                    animate={{
                      scale: stats.engagement === "High 🔥" ? [1, 1.02, 1] : 1,
                      borderColor:
                        stats.engagement === "High 🔥"
                          ? "rgba(59, 130, 246, 0.8)"
                          : "rgba(59, 130, 246, 0.3)",
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-[8px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">
                      {stats.attention}
                    </div>
                  </motion.div>
                  
                  {stats.box && (
                    <motion.div
                      layout
                      initial={false}
                      animate={{ 
                        left: `${stats.box.x}%`, 
                        top: `${stats.box.y}%`, 
                        width: `${stats.box.width}%`, 
                        height: `${stats.box.height}%`,
                        borderColor: stats.score > 7 ? '#60a5fa' : '#3b82f6'
                      }}
                      className="absolute border-[1.5px] rounded-2xl z-20 pointer-events-none shadow-[0_0_30px_rgba(59,130,246,0.2)] ring-1 ring-white/10"
                    >
                      <div className="absolute -top-7 left-0 bg-primary shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white text-[9px] font-black px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-2 border border-white/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        TRACKING: {stats.expression.toUpperCase()}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500 bg-slate-900/50 w-full h-full justify-center">
            {hookError || error ? (
              <AlertTriangle className="h-10 w-10 text-amber-500/50" />
            ) : (
              <CameraOff className="h-12 w-12 opacity-20" />
            )}
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-amber-500 text-slate-400">
                {hookError || error ? "Camera not active. Unable to analyze behaviour." : "Initializing AI Sensor"}
              </p>
              <p className="text-[8px] text-slate-600 uppercase tracking-tighter">
                {hookError || error
                  ? "SYSTEM HALTED: Hardware permissions required"
                  : "Preparing neural vision models..."}
              </p>
            </div>
          </div>
        )}

        {/* Debug Overlays (Conditional) */}
        {showOverlay && (
          <div className="absolute top-4 right-4 flex flex-col gap-1 z-50">
            <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-lg flex flex-col gap-1.5 shadow-2xl">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1 border-b border-white/10 pb-1">Sensor Dump</span>
              <span className="text-[9px] font-mono whitespace-nowrap text-white">Mode: <span className={demoState === "off" ? "text-green-400" : "text-amber-400"}>{demoState.toUpperCase()}</span></span>
              <span className="text-[9px] font-mono whitespace-nowrap text-white">Face Detected: <span className={stats.faceDetected ? "text-green-400" : "text-red-400"}>{stats.faceDetected ? "YES" : "NO"}</span></span>
              <span className="text-[9px] font-mono whitespace-nowrap text-white">Hand Detected: <span className={stats.handDetected ? "text-green-400" : "text-red-400"}>{stats.handDetected ? "YES" : "NO"}</span></span>
              <span className="text-[9px] font-mono whitespace-nowrap text-white">Words: <span className="text-blue-400">{transcriptLength}</span></span>
              <span className="text-[9px] font-mono whitespace-nowrap text-white/90">Sentiment: <span className={sentimentValue > 0 ? "text-green-400" : sentimentValue < 0 ? "text-red-400" : "text-slate-400"}>{sentimentValue > 0 ? 'POS' : sentimentValue < 0 ? 'NEG' : 'NEU'}</span></span>
            </div>

            <Card className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col gap-3 shadow-2xl min-w-[200px] ring-1 ring-white/5">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2.5 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                Intelligence Metrics
              </span>
              <div className="space-y-3 pt-1">
                <BreakdownItem label="Expression" value={stats.breakdown.expression} color={stats.breakdown.expression > 0 ? "text-green-400" : stats.breakdown.expression < 0 ? "text-red-400" : "text-slate-400"} />
                <BreakdownItem label="Sentiment" value={sentimentValue} color={sentimentValue > 0 ? "text-green-400" : sentimentValue < 0 ? "text-red-400" : "text-slate-400"} />
                <BreakdownItem label="Presence" value={stats.breakdown.presence} color={stats.breakdown.presence > 0 ? "text-green-400" : "text-slate-400"} />
              </div>
              <div className="mt-2 pt-3 border-t border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Neural Index</span>
                  <span className="text-[14px] font-mono text-white font-black tracking-tighter">{stats.score.toFixed(2)}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Status Badge */}
        {showOverlay && (
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge
              variant="outline"
              className={`bg-black/60 backdrop-blur-md border-white/10 text-[8px] font-black tracking-widest uppercase transition-colors ${
                isModelLoading ? "text-amber-500" : "text-green-500"
              }`}
            >
              <Brain className="h-2.5 w-2.5 mr-1.5" />
              {isModelLoading ? "Models Loading" : "Vision Engine Active"}
            </Badge>
          </div>
        )}

        {/* Mini HUD (Always show compact metrics if not full overlay) */}
        {!showOverlay && isReady && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center h-fit pointer-events-none">
             <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-6 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${stats.faceDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-[8px] font-black uppercase text-white/50 tracking-widest">Vision</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-mono font-black text-white">{stats.score.toFixed(1)}</span>
                </div>
             </div>
          </div>
        )}

        {/* Legacy HUD Sub-items (Hide if no overlay) */}
        {showOverlay && (
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
            <HUDItem
              icon={<Zap size={12} className={stats.engagement === "High 🔥" ? "text-primary fill-current" : ""} />}
              label="Engagement"
              value={stats.engagement}
            />
            <HUDItem icon={<Smile size={12} />} label="Expression" value={stats.expression} />
            <HUDItem icon={<Hand size={12} />} label="Interaction" value={stats.interaction} />
            <HUDItem
              icon={<Activity size={12} className="animate-pulse text-green-500" />}
              label="Live Stream"
              value={isVideoReady ? "Active Sync" : "Standby"}
            />
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Behaviour Intel Index</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-3 w-3 ${stats.score > 5 ? "text-green-500" : "text-slate-600"}`} />
              <span className="text-[10px] font-bold text-slate-300">Intelligent Response Detection</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono tabular-nums">{stats.score.toFixed(1)}</span>
            <span className="text-[10px] font-bold text-slate-500 ml-1">/10.0</span>
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.score * 10}%` }}
            className={`h-full rounded-full transition-colors duration-500 ${
              stats.score > 7 ? "bg-green-500" : stats.score > 4 ? "bg-primary" : "bg-amber-500"
            } shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
          />
        </div>
      </div>
    </Card>
  );
}

function HUDItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; }) {
  return (
    <div className="bg-black/80 backdrop-blur-xl p-2.5 rounded-xl border border-white/10 flex flex-col gap-1">
      <div className="flex items-center gap-2 opacity-50">
        {icon}
        <span className="text-[7px] uppercase tracking-[0.2em] font-black">{label}</span>
      </div>
      <p className="text-[10px] font-bold text-white truncate leading-none">{value}</p>
    </div>
  );
}

function BreakdownItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className={`font-mono font-bold ${color}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(1)}
      </span>
    </div>
  );
}
