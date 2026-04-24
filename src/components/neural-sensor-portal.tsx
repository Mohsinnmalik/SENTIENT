"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Maximize2, Minimize2, Activity, Shield, Sparkles } from "lucide-react";
import { useNeuralEngine } from "@/hooks/useNeuralEngine";
import { usePathname } from "next/navigation";

export function NeuralSensorPortal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const pathname = usePathname();
  
  const { videoRef, stats } = useNeuralEngine(hasStarted);

  // Auto-hide portal on session page to avoid overlap with full analyzer
  const isSessionPage = pathname.includes("/session/");
  
  if (isSessionPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto group relative h-14 w-14 rounded-2xl bg-primary shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden border border-white/20 transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Brain className="h-7 w-7 text-white relative z-10 group-hover:rotate-12 transition-transform" />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-black animate-pulse" />
          </motion.button>
        ) : (
          <motion.div
            key="portal"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className={`pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ${
              isExpanded ? "w-[320px]" : "w-[220px]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Activity className="h-3 w-3 text-primary animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Neural Sensor</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400">
                   {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Camera Preview */}
              <div className="relative aspect-square rounded-[1.5rem] bg-slate-900 overflow-hidden ring-1 ring-white/10 shadow-inner group">
                {!hasStarted ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
                     <Shield className="h-8 w-8 text-primary/40" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Privacy Guard Active</p>
                     <button 
                        onClick={() => setHasStarted(true)}
                        className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/80"
                     >
                        Initialize Link
                     </button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale-[30%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Neural Targets (Minimized) */}
                    {stats.box && (
                      <motion.div 
                        animate={{ 
                          left: `${stats.box.x}%`, 
                          top: `${stats.box.y}%`, 
                          width: `${stats.box.width}%`, 
                          height: `${stats.box.height}%` 
                        }}
                        className="absolute border border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-lg z-20 pointer-events-none"
                      />
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-white/40 tracking-tighter">Status</span>
                          <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                             <div className="h-1 w-1 rounded-full bg-green-400 animate-ping" />
                             Connected
                          </span>
                       </div>
                       <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black uppercase text-slate-500 block mb-1">Emotion</span>
                    <span className="text-xs font-bold text-white uppercase">{stats.expression}</span>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black uppercase text-slate-500 block mb-1">Engagement</span>
                    <span className="text-xs font-bold text-primary">{stats.score.toFixed(1)}</span>
                 </div>
              </div>

              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="pt-2 space-y-3"
                >
                   <div className="flex justify-between items-center text-[9px] font-bold pb-2 border-b border-white/10">
                      <span className="text-slate-400">Spatial Presence</span>
                      <span className="text-green-400">High</span>
                   </div>
                   <div className="pt-2">
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${stats.score * 10}%` }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                          />
                       </div>
                   </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
