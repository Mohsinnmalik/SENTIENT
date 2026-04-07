"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PRODUCT_TYPES = [
  "Mobile Phone", "Smart Watch", "Earbuds", "Laptop", "Camera", "Gadget", "Wearable", "Other"
];

const FOCUS_AREAS = [
  "Build Quality", "Screen", "Camera", "Performance", "Battery", "Design", "Software", "Overall Feel"
];

import { Badge } from "@/components/ui/badge";

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
    name: "",
    type: "",
    description: "",
    focusAreas: [] as string[],
    targetAudience: "",
    buyerCriteria: "",
    investorCriteria: "",
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleToggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleTypeChange = (v: string | null) => {
    setFormData(prev => ({ ...prev, type: v ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const promise = async () => {
      // 1. Create Product in DB
      const productResponse = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!productResponse.ok) throw new Error("Failed to create product");
      const product = await productResponse.json();

      // 2. Generate Toolkit for that Product in DB
      const toolkitResponse = await fetch("/api/toolkit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      
      if (!toolkitResponse.ok) throw new Error("Failed to generate toolkit");
      const toolkit = await toolkitResponse.json();

      return toolkit;
    };

    toast.promise(promise(), {
      loading: "Generating intelligent toolkit in database...",
      success: (toolkit) => {
        router.push(`/toolkit/${toolkit._id}`);
        return "Toolkit generated and saved successfully!";
      },
      error: "Database error. Please try again.",
    });

    setIsLoading(false);
  };

  if (!hasMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Product Setup</h1>
          <p className="text-muted-foreground">Define your product details to generate AI-powered review questions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none bg-background/40 backdrop-blur-sm shadow-xl ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <span className="h-6 w-1 bg-primary rounded-full" />
                  Product Identity
                </CardTitle>
                <CardDescription>Basic information about your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. NeoTab S21" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold">Product Type</Label>
                    <Select onValueChange={handleTypeChange} required>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Product Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe the key features and value proposition..." 
                    className="min-h-[120px] bg-background/50 border-border/50 resize-none"
                    required
                    value={formData.description}
                    onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-background/40 backdrop-blur-sm shadow-xl ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <span className="h-6 w-1 bg-primary rounded-full" />
                  Review Focus Areas
                </CardTitle>
                <CardDescription>Select specific areas you want the AI to generate questions for.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FOCUS_AREAS.map(area => (
                    <div key={area} className="flex items-center space-x-2 p-3 rounded-xl bg-secondary/30 border border-secondary transition-colors hover:bg-secondary/50">
                      <Checkbox 
                        id={area} 
                        checked={formData.focusAreas.includes(area)}
                        onCheckedChange={() => handleToggleFocusArea(area)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <label 
                        htmlFor={area} 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium"
                      >
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-background/40 backdrop-blur-sm shadow-xl ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <span className="h-6 w-1 bg-primary rounded-full" />
                  Criteria & Audience
                </CardTitle>
                <CardDescription>Help the AI tailor questions for specific personas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-sm font-semibold">Target Audience</Label>
                  <Input 
                    id="audience" 
                    placeholder="e.g. Professional photographers, early tech adopters" 
                    required 
                    value={formData.targetAudience}
                    onChange={e => setFormData(p => ({...p, targetAudience: e.target.value}))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyer" className="text-sm font-semibold">Buyer Criteria</Label>
                  <Textarea 
                    id="buyer" 
                    placeholder="What makes a buyer decide to purchase? (Price, quality, etc.)" 
                    className="min-h-[100px] bg-background/50 border-border/50 resize-none"
                    required
                    value={formData.buyerCriteria}
                    onChange={e => setFormData(p => ({...p, buyerCriteria: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="investor" className="text-sm font-semibold">Investor Criteria (Optional)</Label>
                    <Badge variant="secondary" className="font-normal">Optional</Badge>
                  </div>
                  <Textarea 
                    id="investor" 
                    placeholder="What would an investor look for in this product?" 
                    className="min-h-[100px] bg-background/50 border-border/50 resize-none"
                    value={formData.investorCriteria}
                    onChange={e => setFormData(p => ({...p, investorCriteria: e.target.value}))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Info */}
          <div className="space-y-6">
            <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Question Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm opacity-90 leading-relaxed">
                  Our Sentient AI engine uses your inputs to craft objective, high-intent questions for live user interactions.
                </p>
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-primary hover:bg-neutral-100 h-12 text-base font-bold shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Generate AI Toolkit
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-background/20 backdrop-blur-sm border-2 border-dashed border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-3 text-muted-foreground">
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    Be specific about your product's unique selling points.
                  </li>
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    Define the target audience precisely for better results.
                  </li>
                  <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    Review Focus Areas determine the depth of questions generated.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
