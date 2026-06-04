"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Info, ChevronRight, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

    toast.promise(promise().finally(() => setIsLoading(false)), {
      loading: "Synthesizing intelligence array...",
      success: (toolkit) => {
        router.push(`/toolkit/${toolkit._id}`);
        return "Array compiled successfully.";
      },
      error: (err) => err.message || "Compilation failed.",
    });
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans pb-24">
      {/* Background Dot grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex items-center gap-6 border-b-3 border-border pb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-12 w-12 text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2 flex items-center gap-2">
              <Terminal className="h-3 w-3" /> System Configurator
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground pt-1">Initialize Product</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Identity */}
          <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 md:p-12 relative overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-foreground mb-2">01. Identity Matrix</h2>
              <p className="text-muted-foreground text-sm font-medium">Core parameters defining the target entity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Entity Designation</label>
                <Input 
                  placeholder="e.g. NeoTab S21" required value={formData.name}
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                  className="h-14 rounded-[var(--radius)] bg-card border-3 border-border focus-visible:ring-primary text-base font-bold placeholder:text-muted-foreground/60 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Classification Class</label>
                <div className="relative">
                  <select 
                    required value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value}))}
                    className="w-full h-14 rounded-[var(--radius)] bg-card border-3 border-border text-base font-bold text-foreground px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="" disabled className="bg-card text-muted-foreground">Select class...</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t} className="bg-card text-foreground">{t}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Core Description</label>
              <Textarea 
                placeholder="Detail the technical specifications and value propositions..." required value={formData.description}
                onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                className="min-h-[140px] rounded-[var(--radius)] bg-card border-3 border-border focus-visible:ring-primary text-base font-medium placeholder:text-muted-foreground/60 resize-none p-5"
              />
            </div>
          </div>

          {/* Section 2: Scanners */}
          <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 md:p-12 relative overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
             <div className="mb-10">
              <h2 className="text-2xl font-black text-foreground mb-2">02. Focal Scanners</h2>
              <p className="text-muted-foreground text-sm font-medium">Select vectors for AI question targeting.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FOCUS_AREAS.map(area => {
                const isActive = formData.focusAreas.includes(area);
                return (
                  <div 
                    key={area}
                    onClick={() => handleToggleFocusArea(area)}
                    className={`cursor-pointer rounded-[var(--radius)] border-3 p-4 transition-all duration-150 flex flex-col items-center justify-center gap-3 h-24 shadow-[2px_2px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)] ${
                      isActive 
                        ? 'bg-[#ffe600] text-black border-border shadow-[4px_4px_0px_0px_var(--border)] -translate-x-0.5 -translate-y-0.5' 
                        : 'bg-card border-border text-foreground hover:bg-muted'
                    }`}
                  >
                     <div className={`h-2.5 w-2.5 rounded-full border-2 border-border ${isActive ? 'bg-[#ff007a]' : 'bg-muted-foreground/20'}`} />
                     <span className="text-xs font-black uppercase tracking-widest text-center">{area}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Audience Bias */}
          <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 md:p-12 relative overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
             <div className="mb-10">
              <h2 className="text-2xl font-black text-foreground mb-2">03. Synthesis Bias</h2>
              <p className="text-muted-foreground text-sm font-medium">Inject persona constraints into the neural framework.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Target Persona</label>
                <Input 
                  placeholder="e.g. Enterprise architects, crypto traders" required value={formData.targetAudience}
                  onChange={e => setFormData(p => ({...p, targetAudience: e.target.value}))}
                  className="h-14 rounded-[var(--radius)] bg-card border-3 border-border focus-visible:ring-primary text-base font-bold placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Buyer Purchase Criteria</label>
                <Textarea 
                  placeholder="What triggers a buying decision? (ROI, aesthetics, speed...)" required value={formData.buyerCriteria}
                  onChange={e => setFormData(p => ({...p, buyerCriteria: e.target.value}))}
                  className="min-h-[100px] rounded-[var(--radius)] bg-card border-3 border-border focus-visible:ring-primary text-base font-medium placeholder:text-muted-foreground/60 p-5"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Investor Criteria</label>
                   <span className="px-2 py-0.5 rounded-[var(--radius)] text-[8px] font-black uppercase tracking-widest bg-muted text-muted-foreground border-2 border-border">Optional Node</span>
                </div>
                <Textarea 
                  placeholder="What indicators suggest high ROI for stakeholders?" value={formData.investorCriteria}
                  onChange={e => setFormData(p => ({...p, investorCriteria: e.target.value}))}
                  className="min-h-[100px] rounded-[var(--radius)] bg-card border-3 border-border focus-visible:ring-primary text-base font-medium placeholder:text-muted-foreground/60 p-5"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-8">
            <Button 
              type="submit" 
              className="w-full h-16 bg-[#ff007a] text-white border-3 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_var(--border)] transition-all text-xl font-black uppercase"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-3"><Loader2 className="h-6 w-6 animate-spin" /> SYNTHESIZING NEURAL ARRAY...</span>
              ) : (
                <span className="flex items-center gap-3"><Sparkles className="h-6 w-6" /> COMMENCE SYNTHESIS</span>
              )}
            </Button>
            <p className="text-center mt-6 text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
              <Info className="h-4 w-4 text-[#ff007a]" /> The AI core will parse inputs and compile the toolkit.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
