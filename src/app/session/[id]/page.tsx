"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Mic, Send, Zap, Activity, MessageSquare, 
  ChevronRight, Brain, AlertCircle, TrendingUp, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CameraAnalyzer from "@/components/camera-analyzer";

export default function SessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [toolkit, setToolkit] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [scores, setScores] = useState({
    verbal: 0,
    behaviour: 0,
    total: 0,
    signal: "Neutral"
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
    fetchSessionData();
  }, [params.id]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventLog]);

  const fetchSessionData = async () => {
    try {
      const res = await fetch(`/api/session?id=${params.id}`);
      if (!res.ok) throw new Error("Session not found");
      const { session, toolkit } = await res.json();
      
      setSession(session);
      setToolkit(toolkit);
      addLog("Session synced with MongoDB. Loading intelligence layers...");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load session details");
    }
  };

  const addLog = (event: string) => {
    setEventLog(prev => [...prev.slice(-4), event]);
  };

  const handleScoreUpdate = (bScore: number, signal: string) => {
    setScores(prev => ({
      ...prev,
      behaviour: bScore,
      total: (prev.verbal + bScore) / 2,
      signal
    }));
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    
    try {
      const vScore = Math.floor(Math.random() * 10); // Simulated AI Verbal Analysis
      
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          sessionId: params.id,
          question: toolkit?.reviewQuestions[currentQIndex],
          answer,
          score: (vScore + scores.behaviour) / 2
        }),
      });
      
      if (!res.ok) throw new Error("Failed to save answer");
      
      setScores(prev => ({ ...prev, verbal: vScore }));
      addLog(`Answer submitted for Q${currentQIndex + 1}. Verbal Score: ${vScore}`);
      
      if (currentQIndex < (toolkit?.reviewQuestions?.length || 0) - 1) {
        setCurrentQIndex(prev => prev + 1);
        setAnswer("");
      } else {
        toast.success("Final question answered! Review complete.");
        handleEndSession();
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async () => {
     try {
       await fetch("/api/session", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           action: "end",
           sessionId: params.id
         }),
       });
       router.push("/dashboard"); // Or a report page
     } catch (err) {
       console.error(err);
     }
  };

  if (!hasMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
               <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Product Discovery</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Session ID: {params.id}
            </p>
          </div>
        </div>
        
        {/* Intelligence Signal Banner */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={scores.signal}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`px-6 py-2 rounded-2xl border flex items-center gap-3 shadow-lg ${
              scores.signal.includes("High") ? 'bg-primary/10 border-primary text-primary shadow-primary/20' : 
              scores.signal.includes("Low") ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-amber-500/20' : 
              'bg-slate-500/10 border-slate-500 text-slate-500'
            }`}
          >
            <Zap className={`h-5 w-5 ${scores.signal.includes("High") ? 'fill-current' : ''}`} />
            <span className="font-black uppercase tracking-widest text-xs">
              AI Insight: {scores.signal}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Discovery Logic */}
        <div className="xl:col-span-7 space-y-8">
          <Card className="border-none bg-background/40 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-3 py-1 font-mono text-primary border-primary/20">
                   QUESTION {currentQIndex + 1} OF {toolkit?.reviewQuestions?.length || 5}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <TrendingUp className="h-3 w-3" />
                   Intent Mapping: Active
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQIndex}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="mt-6"
                >
                  <CardTitle className="text-3xl font-black leading-tight text-foreground">
                    "{toolkit?.reviewQuestions[currentQIndex] || "How do you perceive the overall product value?"}"
                  </CardTitle>
                </motion.div>
              </AnimatePresence>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <Input 
                  placeholder="Type participant's verbal response or use voice detection..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                  className="h-16 pl-6 pr-16 text-lg bg-black/5 border-white/10 rounded-2xl focus-visible:ring-primary shadow-inner"
                />
                <Button 
                  size="icon" 
                  disabled={isSubmitting}
                  onClick={handleSubmitAnswer}
                  className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-primary text-white shadow-lg transition-all hover:scale-110 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-8 py-4 opacity-50">
                 <button className="flex flex-col items-center gap-2 hover:text-primary transition-colors group">
                    <div className="h-12 w-12 rounded-full border border-dashed border-current flex items-center justify-center group-hover:bg-primary/10">
                       <Mic className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Start Voice</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 hover:text-primary transition-colors group">
                    <div className="h-12 w-12 rounded-full border border-dashed border-current flex items-center justify-center group-hover:bg-primary/10">
                       <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Add Note</span>
                 </button>
              </div>
            </CardContent>
          </Card>

          {/* Live Behaviour Timeline */}
          <Card className="border-none bg-black/10 backdrop-blur-md ring-1 ring-white/5 h-48 overflow-hidden relative">
            <CardHeader className="py-3 bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
               <CardTitle className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
                  <Activity size={12} className="text-primary" />
                  Real-time Behaviour Log
               </CardTitle>
               <span className="text-[8px] font-mono text-slate-500">Auto-updating Events</span>
            </CardHeader>
            <div className="p-4 space-y-2 overflow-y-auto h-[140px] font-mono text-[10px] text-slate-300">
               {eventLog.map((log, i) => (
                 <div key={i} className="flex gap-3 border-l border-primary/20 pl-3 py-1">
                    <span className="text-primary opacity-50">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span>{log}</span>
                 </div>
               ))}
               <div ref={logEndRef} />
            </div>
            {/* Fade effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </Card>
        </div>

        {/* Right: AI Analysis Hub */}
        <div className="xl:col-span-5 space-y-8">
           <CameraAnalyzer onScoreUpdate={handleScoreUpdate} onEventLog={addLog} demoMode={true} />
           
           {/* Smart Scoring Visualization */}
           <Card className="border-none bg-background/40 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
              <CardHeader>
                 <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Brain className="h-6 w-6 text-primary" />
                    Intent Intelligence Hub
                 </CardTitle>
                 <CardDescription>Multi-dimensional analysis of the participant's reaction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                 <ScoreMetric label="Verbal Sentiment" score={scores.verbal} icon={<MessageSquare size={14}/>} color="bg-primary" />
                 <ScoreMetric label="Behaviour Interest" score={scores.behaviour} icon={<Activity size={14}/>} color="bg-green-500" />
                 
                 <div className="pt-6 border-t border-white/5">
                    <div className="flex items-end justify-between mb-4">
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Composite Interest Score</div>
                          <div className="text-5xl font-black tracking-tighter text-foreground line-clamp-1">{scores.total.toFixed(1)}<span className="text-sm opacity-30 font-normal">/10.0</span></div>
                       </div>
                       <div className="text-right">
                          <CheckCircle2 className={`h-8 w-8 mb-2 ml-auto ${scores.total > 5 ? 'text-primary' : 'text-slate-400'}`} />
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Prediction</div>
                       </div>
                    </div>
                    {/* Glowing Total Score Bar */}
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${scores.total * 10}%` }}
                         className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                       />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreMetric({ label, score, icon, color }: { label: string, score: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             {icon}
             {label}
          </div>
          <span className="text-xs font-mono font-bold text-foreground">{(score * 10).toFixed(0)}%</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${score * 10}%` }}
             className={`h-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
          />
       </div>
    </div>
  );
}
