"use client";

import { useState, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Play, TerminalSquare, AlertCircle, Quote, Loader2, Cpu, CheckSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


interface ToolkitData {
  _id: string;
  productId: {
    _id: string;
    name: string;
    type: string;
    description: string;
  };
  reviewQuestions: string[];
  qualifierQuestions: string[];
  scoringCriteria: string;
}

export default function ToolkitPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ToolkitData | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    const fetchToolkit = async () => {
      try {
        const token = localStorage.getItem("sentient_token") || "";
        const res = await fetch(`/api/toolkit/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setData(result.data);
        else throw new Error(result.message || "Toolkit not found");
      } catch (err) {
        const error = err as Error;
        console.error(error);
        toast.error(error.message || "Toolkit not found or unauthorized");
      }
    };
    fetchToolkit();
    return () => cancelAnimationFrame(frame);
  }, [id]);

  const handleStartSession = async () => {
    if (!data) return;
    setIsStartingSession(true);
    try {
      const token = localStorage.getItem("sentient_token") || "";
      const res = await fetch("/api/session", {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ action: "start", productId: data.productId._id }),
      });
      const sessionResult = await res.json();
      if (!sessionResult.success) throw new Error(sessionResult.message || "Failed to initiate node");
      toast.success("Connection Established. Entering Live Session.");
      router.push(`/session/${sessionResult.data._id}`);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error(error.message || "System error. Node initialization failed.");
    } finally {
      setIsStartingSession(false);
    }
  };

  if (!hasMounted) return null;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center space-y-6">
         <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Decrypting Toolkit Core...</p>
      </div>
    );
  }

  const { productId: product, reviewQuestions, qualifierQuestions, scoringCriteria } = data;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 relative overflow-hidden font-sans pb-24">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-primary/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(99,102,241,0.05),transparent)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
          <div className="space-y-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent text-slate-400 hover:text-white group">
                <ArrowLeft className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                RETURN TO GRID
              </Button>
            </Link>
            <div>
               <div className="flex items-center gap-4 mb-3">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{product.name}</h1>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded uppercase text-[10px] font-black tracking-[0.2em] text-slate-300">
                   {product.type}
                 </div>
               </div>
               <p className="text-lg text-slate-400 font-medium flex items-center gap-3">
                 <Cpu className="h-5 w-5 text-primary" /> Active Neural Array
               </p>
            </div>
          </div>
          
          <Button 
            onClick={handleStartSession} disabled={isStartingSession}
            className="h-16 px-10 rounded-[2rem] bg-gradient-to-r from-primary to-indigo-600 hover:from-primary text-lg font-black tracking-widest uppercase text-white shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
          >
            {isStartingSession ? (
              <span className="flex items-center gap-3"><Loader2 className="h-6 w-6 animate-spin" /> ESTABLISHING LINK...</span>
            ) : (
              <span className="flex items-center gap-3"><Play className="h-6 w-6 fill-current" /> LAUNCH INTERFACE</span>
            )}
          </Button>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Matrix (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="p-10 border-b border-white/[0.03] flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
                     <TerminalSquare className="h-6 w-6 text-primary" /> Interrogation Matrix
                   </h2>
                   <p className="text-slate-500 text-sm font-medium">Core neural questions primed for the live session.</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white leading-none">{reviewQuestions.length}</span>
                  <span className="text-[8px] font-black tracking-widest uppercase text-slate-500">Nodes</span>
                </div>
              </div>

              <div className="p-10 space-y-6">
                {reviewQuestions.map((q: string, i: number) => (
                  <motion.div key={i} variants={item} className="group flex gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300">
                     <div className="h-12 w-12 shrink-0 rounded-full bg-[#04060f] border border-white/10 flex items-center justify-center text-primary font-black shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]">
                       {String(i + 1).padStart(2, "0")}
                     </div>
                     <p className="text-lg md:text-xl font-medium leading-normal text-slate-300 group-hover:text-white pt-2">
                       &quot;{q}&quot;
                     </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Neural Supplements (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Qualifier Block */}
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-[2rem] p-8">
              <h3 className="text-lg font-black text-white flex items-center gap-3 mb-6">
                <CheckSquare className="h-5 w-5 text-green-400" /> Filter Criteria
              </h3>
              <div className="space-y-4">
                {qualifierQuestions.map((q: string, i: number) => (
                  <div key={i} className="text-sm p-5 rounded-2xl bg-green-500/5 border border-green-500/10 text-green-100/70 font-medium">
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Logic Block */}
            <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <h3 className="text-lg font-black text-white flex items-center gap-3 mb-6 relative z-10">
                 <AlertCircle className="h-5 w-5 text-primary" /> Evaluation Logic
               </h3>
               <div className="p-5 rounded-2xl bg-[#04060f]/50 border border-white/5 backdrop-blur-md relative z-10 mb-4">
                 <p className="text-sm leading-relaxed font-semibold text-primary-100 font-mono tracking-tight text-white/80">
                   {scoringCriteria}
                 </p>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 relative z-10">
                 System logic actively parsing during interaction.
               </p>
            </div>

             {/* Safety Notice */}
            <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] flex items-start gap-4">
               <Quote className="h-6 w-6 text-slate-500 shrink-0 mt-1" />
               <p className="text-xs font-semibold text-slate-400 leading-relaxed uppercase tracking-wider">
                 All neural nodes are pre-compiled for minimal bias. Proceed to launch interface when subject is ready.
               </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
