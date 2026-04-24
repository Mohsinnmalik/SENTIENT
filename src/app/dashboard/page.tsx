"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Box, ArrowRight, Clock, Activity, Loader2, AlertCircle, RefreshCcw, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  _id: string;
  name: string;
  type: string;
  createdAt: string;
}

interface ReportTelemetry {
  _id: string;
  overallScore: number;
  visitorType: string;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<ReportTelemetry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("sentient_token") || "";

    try {
      const [prodRes, repRes] = await Promise.all([
        fetch("/api/product", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/report", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      const prodData = await prodRes.json();
      const repData = await repRes.json();

      if (prodData.success) {
        const uniqueProducts: Product[] = [];
        const seenNames = new Set();
        for (const p of prodData.data) {
          if (!seenNames.has(p.name)) {
            seenNames.add(p.name);
            uniqueProducts.push(p);
          }
        }
        setProducts(uniqueProducts);
      } else throw new Error(prodData.message);

      if (repData.success) {
        setReports(repData.data.slice(0, 5));
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message);
      toast.error("Telemetry failure. Unable to sync data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/health").catch(() => {});
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user, fetchDashboardData]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
    } catch { return "UNKNOWN"; }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center gap-6">
       <div className="relative">
          <div className="h-20 w-20 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
          <BrainCircuit className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Initializing Neural Link...</div>
    </div>
  );

  if (!user && !error) return null;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px] hover:[mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_100%,transparent_110%)] transition-all [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-16">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <BrainCircuit className="h-6 w-6 text-primary relative z-10" />
            </div>
            <div className="text-sm font-black tracking-[0.2em] text-white/40 uppercase">Intelligence Array</div>
          </div>
          <Button variant="ghost" onClick={fetchDashboardData} disabled={isLoading} className="text-slate-500 hover:text-white gap-2">
             <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">Resync</span>
          </Button>
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-white line-clamp-1"
          >
            Welcome back, {user?.name?.split(' ')[0] || 'System'}.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 font-medium"
          >
            The telemetry matrix is currently stable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Products", val: products.length.toString() },
            { label: "Total Sessions", val: reports.length > 0 ? "Data available" : "0" },
            { label: "Your Identity", val: "Verified", color: "text-green-400" },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              key={i} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl relative overflow-hidden group"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{stat.label}</div>
              <div className="flex items-baseline gap-1">
                <div className={`text-4xl font-black tracking-tighter ${stat.color || "text-white"}`}>{stat.val}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <Box className="h-6 w-6 text-primary" /> Active Arrays
              </h2>
              <Link href="/setup">
                <Button className="rounded-2xl h-12 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 transition-all font-bold px-6">
                  NEW SETUP
                </Button>
              </Link>
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" className="flex flex-col items-center justify-center p-20 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Syncing...</div>
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" className="bg-red-500/5 border border-red-500/20 rounded-3xl p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Sync Severed</h3>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <Button variant="outline" onClick={fetchDashboardData} className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"><RefreshCcw className="h-4 w-4 mr-2" /> Reboot</Button>
                  </motion.div>
                ) : products.length === 0 ? (
                  <motion.div key="empty" className="bg-white/[0.02] border border-white/[0.05] border-dashed rounded-[2rem] p-16 text-center space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <h3 className="text-2xl font-bold text-white">Void is Empty</h3>
                     <p className="text-slate-400">Initialize a product to track interactions.</p>
                  </motion.div>
                ) : (
                  <motion.div key="list" variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {products.map((p) => (
                       <motion.div key={p._id} variants={item}>
                          <Card className="border-none bg-white/[0.02] ring-1 ring-white/[0.05] rounded-[2rem] overflow-hidden group hover:ring-primary/40 transition-all duration-500 relative">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-2xl font-black text-white truncate">{p.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{p.type}</div>
                               <div className="flex text-xs font-semibold text-slate-400">
                                 <Clock className="h-3.5 w-3.5 mr-1 text-slate-500"/> {formatDate(p.createdAt)}
                               </div>
                            </CardContent>
                             <CardFooter className="flex gap-2">
                              <Link href={`/toolkit/${p._id}`} className="flex-1">
                                <Button className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold px-2">VIEW MTRX <ArrowRight className="h-4 w-4 ml-1" /></Button>
                              </Link>
                              <Link href={`/analytics/product/${p._id}`} className="flex-1">
                                <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold px-2">ANALYSIS</Button>
                              </Link>
                            </CardFooter>
                          </Card>
                       </motion.div>
                     ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" /> Recent Telemetry
            </h2>
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-[2rem] p-6 space-y-6">
              {reports.length === 0 && <p className="text-slate-500 text-sm">No telemetry recorded yet.</p>}
              {reports.map((r) => (
                <div key={r._id} className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.02]">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-primary font-bold">R</div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">Session {r._id.slice(-5)}</div>
                    <div className="text-xs text-slate-400 mb-2">Score: {r.overallScore?.toFixed(1) || '0.0'}</div>
                    <div className="inline-flex px-2 py-1 bg-white/5 rounded text-[10px] font-black text-slate-300 uppercase shrink">
                       {r.visitorType || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
