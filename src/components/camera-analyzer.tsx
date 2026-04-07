"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Brain, User, Hand, Smile, Activity, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CameraAnalyzerProps {
  onScoreUpdate: (score: number, signal: string) => void;
  onEventLog: (event: string) => void;
  demoMode?: boolean;
}

export default function CameraAnalyzer({ onScoreUpdate, onEventLog, demoMode = true }: CameraAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [stats, setStats] = useState({
    expression: "Neutral 😐",
    interaction: "Idle ✋",
    attention: "Focused 👀",
    engagement: "Medium",
    score: 5
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    startVideo();
    
    // Simulate Intelligent Analysis Loop
    const interval = setInterval(() => {
      runAnalysis();
    }, 3000);

    return () => clearInterval(interval);
  }, [demoMode, isCameraActive]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        onEventLog("Camera access granted. Starting live analysis...");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCameraActive(false);
      onEventLog("Camera access denied. Switching to Simulation Mode.");
    } finally {
      setIsModelLoading(false);
    }
  };

  const runAnalysis = () => {
    // If real detection fails or in Demo Mode, we simulate "Intelligent Transitions"
    if (demoMode || !isCameraActive) {
      const expressions = ["Happy 😊", "Focused 😐", "Intrigued 🤔", "Confused ❓"];
      const interactions = ["Active ✋", "Exploring 🔍", "Holding 📦", "Idle ✋"];
      
      const newExpression = expressions[Math.floor(Math.random() * expressions.length)];
      const newInteraction = interactions[Math.floor(Math.random() * interactions.length)];
      
      // Derived Intelligence Logic
      let engagement = "Medium";
      let scoreChange = 0;
      let label = "";

      if (newExpression.includes("Happy") || newExpression.includes("Intrigued")) {
        engagement = "High 🔥";
        scoreChange = 1.5;
        label = "Positive Reaction Detected";
      } else if (newExpression.includes("Confused")) {
        engagement = "Low ⚠️";
        scoreChange = -1.0;
        label = "User seems confused";
      }

      if (newInteraction.includes("Active") || newInteraction.includes("Exploring")) {
        scoreChange += 1;
        onEventLog(`${label || "User"} is exploring the product features.`);
      }

      setStats(prev => {
        const newScore = Math.min(10, Math.max(0, prev.score + scoreChange));
        const signal = newScore > 7 ? "High Intent 🔥" : newScore > 4 ? "Neutral" : "Low Interest ⚠️";
        onScoreUpdate(newScore, signal);
        return {
          expression: newExpression,
          interaction: newInteraction,
          attention: "Focused 👀",
          engagement,
          score: newScore
        };
      });
    }
  };

  if (!hasMounted) return null;

  return (
    <Card className="overflow-hidden border-none bg-black/5 backdrop-blur-md ring-1 ring-white/10 shadow-2xl">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[30%]"
            />
            {/* AI Overlay Bounding Box */}
            <motion.div 
               animate={{ 
                 scale: [1, 1.02, 1],
                 borderColor: ["rgba(59, 130, 246, 0.5)", "rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.5)"] 
               }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-primary/50 rounded-2xl flex items-center justify-center"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                <span className="flex items-center gap-1">
                   <Zap className="h-3 w-3 fill-current" />
                   AI Subject Analyzed
                </span>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <CameraOff className="h-12 w-12 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-widest">Simulating AI Behavior</p>
          </div>
        )}

        {/* Live HUD Overlay */}
        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
          <HUDItem icon={<Brain size={14}/>} label="User State" value={stats.engagement === "High 🔥" ? "Exploring with Interest 🔥" : "Active Exploration"} />
          <HUDItem icon={<Smile size={14}/>} label="Expression" value={stats.expression} />
          <HUDItem icon={<Hand size={14}/>} label="Interaction" value={stats.interaction} />
          <HUDItem icon={<Zap size={14}/>} label="Attention" value={stats.attention} />
        </div>
        
        {/* Glow corner when active */}
        {isCameraActive && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 animate-pulse">
               LIVE ANALYSIS
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Activity className="h-4 w-4 text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Behaviour Intelligence Score</span>
          </div>
          <span className="text-lg font-black text-primary font-mono">{stats.score.toFixed(1)}/10.0</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.score * 10}%` }}
            className={`h-full ${stats.score > 7 ? 'bg-green-500' : stats.score > 4 ? 'bg-primary' : 'bg-amber-500'} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
          />
        </div>
      </div>
    </Card>
  );
}

function HUDItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/5">
      <p className="text-[8px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-[10px] font-bold text-white truncate">{value}</p>
    </div>
  );
}

import { Card } from "@/components/ui/card";
