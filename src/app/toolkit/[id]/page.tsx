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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 text-foreground">
         <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Decrypting Toolkit Core...</p>
      </div>
    );
  }

  const { productId: product, reviewQuestions, qualifierQuestions, scoringCriteria } = data;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans pb-24">
       {/* Background Dot grid */}
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-3 border-border pb-8">
          <div className="space-y-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground group">
                <ArrowLeft className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                RETURN TO GRID
              </Button>
            </Link>
            <div>
               <div className="flex items-center gap-4 mb-3">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{product.name}</h1>
                 <div className="px-3 py-1 bg-accent text-accent-foreground border-2 border-border rounded uppercase text-[10px] font-black tracking-[0.2em] shadow-[1.5px_1.5px_0px_0px_var(--border)]">
                   {product.type}
                 </div>
               </div>
               <p className="text-lg text-muted-foreground font-bold flex items-center gap-3">
                 <Cpu className="h-5 w-5 text-secondary" /> Active Neural Array
               </p>
            </div>
          </div>
          
          <Button 
            onClick={handleStartSession} disabled={isStartingSession}
            className="h-16 px-10 bg-[#ff007a] text-white border-3 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_var(--border)] transition-all text-lg font-black tracking-widest uppercase"
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
            <div className="bg-card border-3 border-border rounded-[var(--radius)] overflow-hidden relative shadow-[4px_4px_0px_0px_var(--border)]">
              <div className="p-10 border-b-3 border-border flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black text-foreground flex items-center gap-3 mb-2">
                     <TerminalSquare className="h-6 w-6 text-primary" /> Interrogation Matrix
                   </h2>
                   <p className="text-muted-foreground text-sm font-medium">Core neural questions primed for the live session.</p>
                </div>
                <div className="h-14 w-14 rounded-[var(--radius)] bg-primary text-primary-foreground border-2 border-border flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_var(--border)]">
                  <span className="text-xl font-black leading-none">{reviewQuestions.length}</span>
                  <span className="text-[8px] font-black tracking-widest uppercase opacity-70">Nodes</span>
                </div>
              </div>

              <div className="p-10 space-y-6">
                {reviewQuestions.map((q: string, i: number) => (
                  <motion.div key={i} variants={item} className="group flex gap-6 p-6 rounded-[var(--radius)] bg-card border-3 border-border hover:bg-muted transition-all shadow-[2px_2px_0px_0px_var(--border)]">
                     <div className="h-12 w-12 shrink-0 rounded-[var(--radius)] bg-accent text-accent-foreground border-2 border-border flex items-center justify-center font-black shadow-[2px_2px_0px_0px_var(--border)]">
                       {String(i + 1).padStart(2, "0")}
                     </div>
                     <p className="text-lg md:text-xl font-black leading-normal text-foreground pt-2">
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
            <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 shadow-[4px_4px_0px_0px_var(--border)]">
              <h3 className="text-lg font-black text-foreground flex items-center gap-3 mb-6">
                <CheckSquare className="h-5 w-5 text-[#2ee59d]" /> Filter Criteria
              </h3>
              <div className="space-y-4">
                {qualifierQuestions.map((q: string, i: number) => (
                  <div key={i} className="text-sm p-5 rounded-[var(--radius)] bg-[#2ee59d]/10 border-2 border-border text-foreground font-bold shadow-[2px_2px_0px_0px_var(--border)]">
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Logic Block */}
            <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 relative overflow-hidden group shadow-[4px_4px_0px_0px_var(--border)]">
               <h3 className="text-lg font-black text-foreground flex items-center gap-3 mb-6 relative z-10">
                 <AlertCircle className="h-5 w-5 text-primary" /> Evaluation Logic
               </h3>
               <div className="p-5 rounded-[var(--radius)] bg-primary text-primary-foreground border-2 border-border relative z-10 mb-4 shadow-[2.5px_2.5px_0px_0px_var(--border)]">
                 <p className="text-sm leading-relaxed font-bold text-black font-mono tracking-tight">
                   {scoringCriteria}
                 </p>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff007a] relative z-10">
                 System logic actively parsing during interaction.
               </p>
            </div>

             {/* Safety Notice */}
            <div className="p-6 rounded-[var(--radius)] border-3 border-border bg-muted flex items-start gap-4 shadow-[3px_3px_0px_0px_var(--border)]">
               <Quote className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
               <p className="text-xs font-bold text-muted-foreground leading-relaxed uppercase tracking-wider">
                 All neural nodes are pre-compiled for minimal bias. Proceed to launch interface when subject is ready.
               </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
