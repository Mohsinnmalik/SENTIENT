"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Play, LayoutGrid, CheckCircle, Info, Sparkles, AlertCircle, Quote, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AIResponse = {
  review_questions: string[];
  qualifier_questions: string[];
  scoring_criteria: string;
};

type ProductData = {
  name: string;
  type: string;
};

export default function ToolkitPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const fetchToolkit = async () => {
      try {
        const res = await fetch(`/api/toolkit/${params.id}`);
        if (!res.ok) throw new Error("Toolkit not found");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load toolkit");
      }
    };
    fetchToolkit();
  }, [params.id]);

  const handleStartSession = async () => {
    if (!data) return;
    setIsStartingSession(true);
    
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          productId: data.productId._id
        }),
      });
      
      if (!res.ok) throw new Error("Failed to start session");
      const session = await res.json();
      
      toast.success("Live Session Initiated!");
      router.push(`/session/${session._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not start session");
    } finally {
      setIsStartingSession(false);
    }
  };

  if (!hasMounted) return null;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading intelligent toolkit...</p>
      </div>
    );
  }

  const { productId: product, reviewQuestions, qualifierQuestions, scoringCriteria } = data;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
              <Badge variant="secondary" className="px-3 py-1 bg-secondary/50 border border-secondary text-base font-medium">
                {product.type}
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Generated Interaction Toolkit
            </p>
          </div>
        </div>
        <Button 
          onClick={handleStartSession}
          disabled={isStartingSession}
          className="h-14 px-8 text-lg font-bold gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isStartingSession ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6" />}
          Start Live Session
        </Button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Review Questions */}
        <Card className="lg:col-span-2 border-none bg-background/40 backdrop-blur-sm shadow-xl ring-1 ring-border/50">
          <CardHeader className="pb-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                   <LayoutGrid className="h-6 w-6 text-primary" />
                   Review Questions
                </CardTitle>
                <CardDescription>Core questions to ask during product testing.</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">5 Questions</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            {reviewQuestions.map((q: string, i: number) => (
              <motion.div 
                key={i} 
                variants={item}
                className="group flex gap-5 p-5 rounded-2xl bg-secondary/30 border border-secondary transition-all hover:bg-secondary/50 hover:border-primary/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  {i + 1}
                </div>
                <p className="text-lg font-medium leading-relaxed pt-1 group-hover:text-foreground">
                  "{q}"
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          {/* Qualifier Questions */}
          <Card className="border-none bg-background/40 backdrop-blur-sm shadow-xl ring-1 ring-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Qualifiers
              </CardTitle>
              <CardDescription>Filtering high-intent users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualifierQuestions.map((q: string, i: number) => (
                <div key={i} className="text-sm p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-foreground/80 italic font-medium">
                  {q}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Scoring Criteria */}
          <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                Scoring Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
                <p className="text-sm leading-relaxed font-medium">
                  {scoringCriteria}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-80 bg-black/10 p-3 rounded-lg">
                <Info className="h-4 w-4 shrink-0" />
                This logic will be used to automatically score responses during the live session.
              </div>
            </CardContent>
          </Card>

          {/* Action Note */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-dashed border-amber-500/20 text-center">
            <Quote className="h-6 w-6 text-amber-500 mx-auto mb-3" />
            <p className="text-xs text-amber-600 font-medium">
              These questions are generated to minimize bias and maximize actionable feedback.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

