"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CameraOff,
  Hand,
  Smile,
  Activity,
  Zap,
  AlertTriangle,
  Brain,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNeuralEngine, DetectionQuality } from "@/hooks/useNeuralEngine";

interface CameraAnalyzerProps {
  onScoreUpdate: (score: number, signal: string, detectionQuality?: DetectionQuality) => void;
  onEventLog: (event: string) => void;
  demoState?: "off" | "standard" | "perfect";
  active?: boolean;
}

// Emotion → color mapping for vivid feedback
const EMOTION_COLORS: Record<string, string> = {
  happy:     "text-green-400 bg-green-500/10 border-green-500/30",
  surprised: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  neutral:   "text-slate-400 bg-white/5 border-white/10",
  fearful:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  sad:       "text-blue-300 bg-blue-400/10 border-blue-400/30",
  disgusted: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  angry:     "text-red-400 bg-red-500/10 border-red-500/30",
};

const EMOTION_RING: Record<string, string> = {
  happy:     "ring-green-500/40 shadow-green-500/10",
  surprised: "ring-blue-500/40 shadow-blue-500/10",
  neutral:   "ring-white/10 shadow-transparent",
  fearful:   "ring-yellow-500/40 shadow-yellow-500/10",
  sad:       "ring-blue-400/30 shadow-blue-400/10",
  disgusted: "ring-orange-500/40 shadow-orange-500/10",
  angry:     "ring-red-500/50 shadow-red-500/20",
};

const t = (s: string) => s;

export default function CameraAnalyzer({
  onScoreUpdate,
  onEventLog,
  demoState = "off",
  active = true,
}: CameraAnalyzerProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasMounted, setHasMounted]     = useState(false);
  const lastLoggedRef = useRef<string>("");

  const engineActive = active && demoState === "off";

  const {
    videoRef,
    stats: hookStats,
    isReady: hookIsReady,
    error: hookError,
    stopCamera,
    detectionQuality,
  } = useNeuralEngine(engineActive);

  // ── Stop camera the moment demoState changes or unmount ──────
  useEffect(() => {
    return () => {
      // Cleanup: stop camera when this component unmounts
      stopCamera();
    };
  }, [stopCamera]);

  // If demo mode gets turned on mid-session, stop real camera
  useEffect(() => {
    if (demoState !== "off") {
      stopCamera();
    }
  }, [demoState, stopCamera]);

  const isReady = demoState !== "off" ? true : hookIsReady;

  // ── Demo / Real stats ─────────────────────────────────────────
  const viewStats = useMemo(() => {
    if (demoState === "perfect") {
      return {
        rawExpression: "happy",
        expression:    "Happy 😊",
        interaction:   "Approval 👍",
        attention:     "Focused 👀",
        engagement:    "High 🔥" as const,
        score:         9.5,
        faceDetected:  true,
        handDetected:  true,
        box:           { x: 35, y: 25, width: 30, height: 50 },
        breakdown:     { expression: 4, sentiment: 3.5, presence: 4 },
        confidence:    95,
        gesture:       "thumbsUp",
        postureState:  "leaning_in" as const,
      };
    }
    if (demoState === "standard") {
      return {
        rawExpression: "neutral",
        expression:    "Neutral 😐",
        interaction:   "Watching 👁️",
        attention:     "Focused 👀",
        engagement:    "Medium" as "High 🔥" | "Medium" | "Low ⚠️",
        score:         6.5,
        faceDetected:  true,
        handDetected:  false,
        box:           { x: 35, y: 25, width: 30, height: 50 },
        breakdown:     { expression: 0.3, sentiment: 0, presence: 2.5 },
        confidence:    80,
        gesture:       null,
        postureState:  "neutral" as const,
      };
    }

    if (!hookStats) return null;

    let engagement: "High 🔥" | "Medium" | "Low ⚠️" = "Medium";
    if (hookStats.score > 7.5) engagement = "High 🔥";
    else if (hookStats.score < 4) engagement = "Low ⚠️";

    return {
      rawExpression: hookStats.expression,
      expression:    hookStats.expressionLabel,
      interaction:   hookStats.handDetected ? (hookStats.gestureLabel || "Exploring ✋") : "Watching 👁️",
      attention:     hookStats.faceDetected ? "Focused 👀" : "Distracted 👀",
      engagement,
      score:         hookStats.score,
      faceDetected:  hookStats.faceDetected,
      handDetected:  hookStats.handDetected,
      box:           hookStats.box,
      breakdown:     hookStats.breakdown,
      confidence:    hookStats.expressionConfidence,
      gesture:       hookStats.gesture,
      postureState:  hookStats.postureState,
    };
  }, [hookStats, demoState]);

  // ── Event Logging ─────────────────────────────────────────────
  useEffect(() => {
    if (!hookStats || demoState !== "off") return;
    const { gesture, postureState, expression, faceDetected } = hookStats;

    // Posture events
    if (faceDetected) {
      if (postureState === "leaning_in" && lastLoggedRef.current !== "leaning_in") {
        lastLoggedRef.current = "leaning_in";
        onEventLog("High engagement: Subject leaning in (Physical Interest).");
      } else if (postureState === "leaning_back" && lastLoggedRef.current !== "leaning_back") {
        lastLoggedRef.current = "leaning_back";
        onEventLog("Low engagement: Subject leaning back (Detachment).");
      } else if (postureState === "neutral" && (lastLoggedRef.current === "leaning_in" || lastLoggedRef.current === "leaning_back")) {
        lastLoggedRef.current = "neutral";
      }
    }

    // Gesture events
    const gKey = `gesture_${gesture ?? "none"}`;
    if (lastLoggedRef.current !== gKey) {
      if (gesture === "thumbsUp") {
        lastLoggedRef.current = gKey;
        onEventLog("Strong approval signal: Thumbs up detected.");
      } else if (gesture === "thumbsDown") {
        lastLoggedRef.current = gKey;
        onEventLog("Rejection signal: Thumbs down detected.");
      } else if (gesture === "pointingUp") {
        lastLoggedRef.current = gKey;
        onEventLog("High-intent pointing gesture detected.");
      } else if (gesture === "pinch") {
        lastLoggedRef.current = gKey;
        onEventLog("Examination behavior: Subject pinching/examining.");
      } else if (!gesture && lastLoggedRef.current.startsWith("gesture_")) {
        lastLoggedRef.current = "neutral";
      }
    }

    // Negative expression events
    if (faceDetected && (expression === "disgusted" || expression === "angry" || expression === "sad")) {
      const eKey = `expr_${expression}`;
      if (lastLoggedRef.current !== eKey) {
        lastLoggedRef.current = eKey;
        onEventLog(`Negative expression: Subject appears ${expression}.`);
      }
    }

    // Distracted
    if (!faceDetected && lastLoggedRef.current !== "distracted") {
      lastLoggedRef.current = "distracted";
      onEventLog("Attention loss: Face not detected — subject may be distracted.");
    } else if (faceDetected && lastLoggedRef.current === "distracted") {
      lastLoggedRef.current = "neutral";
      onEventLog("Attention restored: Face re-detected.");
    }
  }, [hookStats, onEventLog, demoState]);

  // ── Score propagation ─────────────────────────────────────────
  useEffect(() => {
    if (!viewStats) return;
    const { score } = viewStats;
    const sig =
      score > 7.5 ? "High Intent 🔥" :
      score > 5.0 ? "Positive Engagement" :
      score > 3.0 ? "Monitoring" :
      "Low Interest ⚠️";
    onScoreUpdate(score, sig, demoState !== "off" ? "full" : (detectionQuality ?? "full"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStats?.score, onScoreUpdate, demoState, detectionQuality]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const rawExpr = viewStats?.rawExpression ?? "neutral";
  const emotionColor = EMOTION_COLORS[rawExpr] ?? EMOTION_COLORS.neutral;
  const emotionRing  = EMOTION_RING[rawExpr]  ?? EMOTION_RING.neutral;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Camera Box ───────────────────────────────────────── */}
      <Card
        className={`relative aspect-video overflow-hidden border-none bg-slate-950 ring-1 shadow-2xl transition-all duration-500 ${emotionRing}`}
      >
        {/* Always in DOM so ref is valid */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onCanPlay={() => setIsVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isReady && isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Loading / Error overlay */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center gap-4 bg-slate-900/60 justify-center z-10">
            {hookError
              ? <AlertTriangle className="h-10 w-10 text-amber-500/60" />
              : <div className="relative">
                  <div className="h-14 w-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <CameraOff className="absolute inset-0 m-auto h-5 w-5 text-primary/40" />
                </div>
            }
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
              {hookError ? t("Camera access denied") : t("Linking Neural Feed...")}
            </p>
            {hookError && (
              <p className="text-[9px] text-amber-500/70 max-w-[200px] text-center leading-relaxed">{hookError}</p>
            )}
          </div>
        )}

        {/* Live overlays */}
        {isReady && isVideoReady && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Scanning line */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10"
              />

              {/* Face bounding box */}
              {viewStats?.box && (
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    left:   `${viewStats.box.x}%`,
                    top:    `${viewStats.box.y}%`,
                    width:  `${viewStats.box.width}%`,
                    height: `${viewStats.box.height}%`,
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className={`absolute border rounded-xl z-20 pointer-events-none transition-colors duration-300 ${
                    rawExpr === "happy"    ? "border-green-400/70 shadow-[0_0_12px_rgba(74,222,128,0.3)]" :
                    rawExpr === "angry"   ? "border-red-400/70   shadow-[0_0_12px_rgba(248,113,113,0.3)]" :
                    rawExpr === "sad"     ? "border-blue-400/70  shadow-[0_0_12px_rgba(96,165,250,0.25)]" :
                    rawExpr === "disgusted" ? "border-orange-400/70 shadow-[0_0_12px_rgba(251,146,60,0.3)]" :
                    "border-primary/60 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                  }`}
                >
                  {/* Emotion label above box */}
                  <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black px-2 py-0.5 rounded-full border backdrop-blur-md uppercase tracking-tighter whitespace-nowrap ${emotionColor}`}>
                    {viewStats.expression}
                  </div>

                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current rounded-tl" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current rounded-br" />
                </motion.div>
              )}

              {/* No face detected indicator */}
              {!viewStats?.faceDetected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2 flex items-center gap-2 backdrop-blur-md">
                    <EyeOff className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{t("Face Lost")}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Status pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-30">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${viewStats?.faceDetected ? "bg-green-500 shadow-[0_0_6px_#22c55e]" : "bg-red-500 shadow-[0_0_6px_#ef4444]"}`} />
          <span className="text-[7px] font-black text-white/50 uppercase tracking-widest">
            {viewStats?.faceDetected ? t("Tracking") : t("Searching")}
          </span>
        </div>

        {/* Confidence badge */}
        {viewStats?.faceDetected && viewStats.confidence > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-30">
            <span className="text-[7px] font-mono font-black text-white/40">
              {viewStats.confidence}{t("% conf")}
            </span>
          </div>
        )}
      </Card>

      {/* ── Stats Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Emotion card */}
        <Card className={`p-4 flex flex-col gap-3 border transition-all duration-300 ${emotionColor}`}>
          <div className="flex items-center gap-2 opacity-60">
            <Smile size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">{t("Emotion")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{viewStats?.expression?.split(" ")[1] ?? "😐"}</span>
            <span className="text-[10px] font-black text-white truncate">
              {viewStats?.expression?.split(" ")[0] ?? "Neutral"}
            </span>
          </div>
        </Card>

        {/* Attention card */}
        <Card className={`p-4 flex flex-col gap-3 border border-white/5 bg-white/[0.02] transition-all duration-300 ${
          !viewStats?.faceDetected ? "border-red-500/20 bg-red-500/5" : ""
        }`}>
          <div className="flex items-center gap-2 opacity-60">
            <Eye size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">{t("Attention")}</span>
          </div>
          <span className="text-[10px] font-black text-white">{viewStats?.attention ?? "—"}</span>
        </Card>

        {/* Gesture / Kinetic */}
        <Card className="p-4 flex flex-col gap-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 opacity-60">
            <Hand size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">{t("Gesture")}</span>
          </div>
          <span className="text-[10px] font-black text-white truncate">{viewStats?.interaction ?? "—"}</span>
        </Card>

        {/* Intent */}
        <Card className={`p-4 flex flex-col gap-3 border transition-all duration-300 ${
          viewStats?.engagement === "High 🔥"
            ? "border-green-500/20 bg-green-500/5"
            : viewStats?.engagement === "Low ⚠️"
            ? "border-amber-500/20 bg-amber-500/5"
            : "border-white/5 bg-white/[0.02]"
        }`}>
          <div className="flex items-center gap-2 opacity-60">
            <ChevronRight size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">{t("Intent")}</span>
          </div>
          <span className="text-[10px] font-black text-white">{viewStats?.engagement ?? "—"}</span>
        </Card>
      </div>

      {/* ── Signal Decomposition ─────────────────────────────── */}
      <Card className="bg-black/20 border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity size={11} className="text-primary" /> {t("Signal Decomposition")}
          </span>
          <span className={`text-[9px] font-mono font-black ${
            (viewStats?.score ?? 0) > 7 ? "text-green-400" :
            (viewStats?.score ?? 0) > 4 ? "text-primary" : "text-amber-400"
          }`}>
            {(viewStats?.score ?? 0).toFixed(1)} / 10
          </span>
        </div>

        <div className="space-y-3">
          <GaugeBar label="Facial Expression" value={viewStats?.breakdown.expression ?? 0} icon={<Smile size={10} />} />
          <GaugeBar label="Gesture Pulse"     value={viewStats?.breakdown.sentiment  ?? 0} icon={<Hand size={10} />} />
          <GaugeBar label="Presence Score"    value={viewStats?.breakdown.presence   ?? 0} icon={<Zap size={10} />} />
        </div>

        {/* Overall bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
              <Brain size={9} className="inline mr-1" /> {t("Composite")}
            </span>
            <span className="text-[9px] font-mono font-black text-white/40">{(viewStats?.score ?? 0).toFixed(1)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(viewStats?.score ?? 0) * 10}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)] ${
                (viewStats?.score ?? 0) > 7.5 ? "bg-green-500" :
                (viewStats?.score ?? 0) > 4   ? "bg-primary" : "bg-amber-500"
              }`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function GaugeBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const normVal = Math.max(-5, Math.min(5, value));
  const percent = ((normVal + 5) / 10) * 100;
  const isPos = value >= 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
          {icon} {label}
        </span>
        <span className={`text-[9px] font-mono font-black ${isPos ? "text-green-400" : "text-red-400"}`}>
          {isPos ? "+" : ""}{value.toFixed(1)}
        </span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`h-full rounded-full ${isPos ? "bg-green-500/60" : "bg-red-500/60"}`}
        />
      </div>
    </div>
  );
}
