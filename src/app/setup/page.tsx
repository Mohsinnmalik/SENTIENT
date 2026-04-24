"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Loader2, Info, ChevronRight, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PRODUCT_TYPES = ["Mobile Phone", "Smart Watch", "Earbuds", "Laptop", "Camera", "Gadget", "Wearable", "Other"];
const FOCUS_AREAS = ["Build Quality", "Screen", "Camera", "Performance", "Battery", "Design", "Software", "Overall Feel"];

interface FormData {
  name: string;
  type: string;
  description: string;
  focusAreas: string[];
  targetAudience: string;
  buyerCriteria: string;
  investorCriteria: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "", type: "", description: "", focusAreas: [], targetAudience: "", buyerCriteria: "", investorCriteria: "",
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleToggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const promise = async () => {
      const token = localStorage.getItem("sentient_token") || "";

      // 1. Create Product
      const productRes = await fetch("/api/product", {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify(formData),
      });
      const productResult = await productRes.json();
      if (!productResult.success) throw new Error(productResult.message || "Failed to create product");
      
      // 2. Generate Toolkit
      const toolkitRes = await fetch("/api/toolkit/generate", {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ productId: productResult.data._id }),
      });
      const toolkitResult = await toolkitRes.json();
      if (!toolkitResult.success) throw new Error(toolkitResult.message || "Failed to generate toolkit");
      return toolkitResult.data;
    };

    toast.promise(promise(), {
      loading: "Synthesizing intelligence array...",
      success: (toolkit) => {
        router.push(`/toolkit/${toolkit._id}`);
        return "Array compiled successfully.";
      },
      error: (err) => err.message || "Compilation failed.",
    });

    setIsLoading(false);
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 relative overflow-hidden font-sans pb-24">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex items-center gap-6 border-b border-white/5 pb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/10 hover:text-white transition-all text-slate-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
              <Terminal className="h-3 w-3" /> System Configurator
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white pt-1">Initialize Product</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Identity */}
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="mb-10">
              <h2 className="text-2xl font-black text-white mb-2">01. Identity Matrix</h2>
              <p className="text-slate-500 text-sm font-medium">Core parameters defining the target entity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Entity Designation</label>
                <Input 
                  placeholder="e.g. NeoTab S21" required value={formData.name}
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                  className="h-14 rounded-2xl bg-white/[0.03] border-white/10 focus-visible:ring-primary/50 text-base font-bold placeholder:text-slate-600 focus-visible:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Classification Class</label>
                <div className="relative">
                  <select 
                    required value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value}))}
                    className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/10 text-base font-bold text-white px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="" disabled className="bg-[#04060f] text-slate-500">Select class...</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t} className="bg-[#04060f]">{t}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Core Description</label>
              <Textarea 
                placeholder="Detail the technical specifications and value propositions..." required value={formData.description}
                onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                className="min-h-[140px] rounded-2xl bg-white/[0.03] border-white/10 focus-visible:ring-primary/50 text-base font-medium placeholder:text-slate-600 focus-visible:border-primary/50 resize-none p-5"
              />
            </div>
          </div>

          {/* Section 2: Scanners */}
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
             <div className="mb-10">
              <h2 className="text-2xl font-black text-white mb-2">02. Focal Scanners</h2>
              <p className="text-slate-500 text-sm font-medium">Select vectors for AI question targeting.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FOCUS_AREAS.map(area => {
                const isActive = formData.focusAreas.includes(area);
                return (
                  <div 
                    key={area}
                    onClick={() => handleToggleFocusArea(area)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 flex flex-col items-center justify-center gap-3 h-24 ${
                      isActive 
                        ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04] hover:border-white/10'
                    }`}
                  >
                     <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary shadow-[0_0_8px_theme(colors.primary.DEFAULT)]' : 'bg-white/20'}`} />
                     <span className="text-xs font-black uppercase tracking-widest text-center">{area}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Audience Bias */}
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
             <div className="mb-10">
              <h2 className="text-2xl font-black text-white mb-2">03. Synthesis Bias</h2>
              <p className="text-slate-500 text-sm font-medium">Inject persona constraints into the neural framework.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Persona</label>
                <Input 
                  placeholder="e.g. Enterprise architects, crypto traders" required value={formData.targetAudience}
                  onChange={e => setFormData(p => ({...p, targetAudience: e.target.value}))}
                  className="h-14 rounded-2xl bg-white/[0.03] border-white/10 focus-visible:ring-primary/50 text-base font-bold placeholder:text-slate-600 focus-visible:border-primary/50"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Buyer Purchase Criteria</label>
                <Textarea 
                  placeholder="What triggers a buying decision? (ROI, aesthetics, speed...)" required value={formData.buyerCriteria}
                  onChange={e => setFormData(p => ({...p, buyerCriteria: e.target.value}))}
                  className="min-h-[100px] rounded-2xl bg-white/[0.03] border-white/10 focus-visible:ring-primary/50 text-base font-medium placeholder:text-slate-600 p-5"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investor Criteria</label>
                   <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/10">Optional Node</span>
                </div>
                <Textarea 
                  placeholder="What indicators suggest high ROI for stakeholders?" value={formData.investorCriteria}
                  onChange={e => setFormData(p => ({...p, investorCriteria: e.target.value}))}
                  className="min-h-[100px] rounded-2xl bg-white/[0.03] border-white/10 focus-visible:ring-primary/50 text-base font-medium placeholder:text-slate-600 p-5"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-8">
            <Button 
              type="submit" 
              className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-primary to-indigo-600 hover:from-primary text-xl font-black tracking-wide uppercase text-white shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative border-0"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              {isLoading ? (
                <span className="flex items-center gap-3"><Loader2 className="h-6 w-6 animate-spin" /> SYNTHESIZING NEURAL ARRAY...</span>
              ) : (
                <span className="flex items-center gap-3"><Sparkles className="h-6 w-6" /> COMMENCE SYNTHESIS</span>
              )}
            </Button>
            <p className="text-center mt-6 text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
              <Info className="h-4 w-4" /> The AI core will parse inputs and compile the toolkit.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
