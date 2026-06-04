"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Box, ArrowRight, Clock, Loader2, AlertCircle, RefreshCcw, Sparkles } from "lucide-react";
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
const t = (s: string) => s;

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-foreground">
       <div className="relative">
          <div className="h-20 w-20 rounded-full border-3 border-muted border-t-primary animate-spin" />
          <div className="absolute inset-0 m-auto h-10 w-10 rounded-[var(--radius)] overflow-hidden">
             <Image src="/logo.png" alt="SENTIENT Logo" width={40} height={40} className="h-full w-full object-cover animate-pulse" />
          </div>
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">{t("Initializing Neural Link...")}</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-16">
        <div className="flex items-center justify-between border-b-3 border-border pb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[var(--radius)] bg-white border-2 border-border flex items-center justify-center relative group shadow-[2.5px_2.5px_0px_0px_var(--border)] overflow-hidden">
              <Image src="/logo.png" alt="SENTIENT Logo" width={48} height={48} className="h-full w-full object-cover relative z-10" />
            </div>
            <div className="text-sm font-black tracking-[0.2em] text-foreground uppercase">{t("Intelligence Array")}</div>
          </div>
          <Button variant="ghost" onClick={fetchDashboardData} disabled={isLoading} className="text-muted-foreground hover:text-foreground gap-2">
             <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">{t("Resync")}</span>
          </Button>
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-foreground line-clamp-1"
          >
            {t("Welcome back, ")}{user?.name?.split(' ')[0] || 'System'}{t(".")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground font-bold"
          >
            {t("The telemetry matrix is currently stable.")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Active Products", val: products.length.toString() },
            { label: "Total Sessions", val: reports.length > 0 ? "Data available" : "0" },
            { label: "Your Identity", val: "Verified", color: "text-[#2ee59d]" },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              key={i} className="bg-card border-3 border-border p-6 rounded-[var(--radius)] relative overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{stat.label}</div>
              <div className="flex items-baseline gap-1">
                <div className={`text-4xl font-black tracking-tighter ${stat.color || "text-foreground"}`}>{stat.val}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                <Box className="h-6 w-6 text-primary" /> {t("Active Arrays")}
              </h2>
              <Link href="/setup">
                <Button className="h-12 px-6">
                  {t("NEW SETUP")}
                </Button>
              </Link>
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" className="flex flex-col items-center justify-center p-20 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">{t("Syncing...")}</div>
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" className="bg-destructive/10 border-3 border-destructive rounded-[var(--radius)] p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">{t("Sync Severed")}</h3>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button variant="outline" onClick={fetchDashboardData} className="bg-card text-foreground"><RefreshCcw className="h-4 w-4 mr-2" /> {t("Reboot")}</Button>
                  </motion.div>
                ) : products.length === 0 ? (
                  <motion.div key="empty" className="bg-card border-3 border-dashed border-border rounded-[var(--radius)] p-16 text-center space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <h3 className="text-2xl font-bold text-foreground">{t("Void is Empty")}</h3>
                     <p className="text-muted-foreground">{t("Initialize a product to track interactions.")}</p>
                  </motion.div>
                ) : (
                  <motion.div key="list" variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {products.map((p) => (
                       <motion.div key={p._id} variants={item}>
                          <Card className="border-3 border-border bg-card rounded-[var(--radius)] overflow-hidden group shadow-[4px_4px_0px_0px_var(--border)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)]">
                            <CardHeader className="pb-4 bg-primary text-primary-foreground border-b-3 border-border">
                              <CardTitle className="text-2xl font-black truncate">{p.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6 text-foreground bg-card">
                               <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{p.type}</div>
                               <div className="flex text-xs font-semibold text-muted-foreground">
                                 <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground/75"/> {formatDate(p.createdAt)}
                               </div>
                            </CardContent>
                             <CardFooter className="flex gap-2 pb-6 px-6 pt-0 bg-card">
                              <Link href={`/toolkit/${p._id}`} className="flex-1">
                                <Button variant="outline" className="w-full text-xs font-black px-2">{t("VIEW MTRX ")}<ArrowRight className="h-4 w-4 ml-1" /></Button>
                              </Link>
                              <Link href={`/analytics/product/${p._id}`} className="flex-1">
                                <Button variant="secondary" className="w-full text-xs font-black px-2">{t("ANALYSIS")}</Button>
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
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-8">
              <Sparkles className="h-4 w-4 text-secondary" /> {t("Recent Telemetry")}
            </h2>
            <div className="bg-card border-3 border-border rounded-[var(--radius)] p-6 space-y-6 shadow-[4px_4px_0px_0px_var(--border)]">
              {reports.length === 0 && <p className="text-muted-foreground text-sm">{t("No telemetry recorded yet.")}</p>}
              {reports.map((r) => (
                <div key={r._id} className="flex gap-4 p-4 rounded-[var(--radius)] border-2 border-transparent hover:border-border hover:bg-muted transition-all">
                  <div className="h-10 w-10 rounded-[var(--radius)] bg-[#ffe600] border-2 border-border flex items-center justify-center text-black font-black shadow-[1.5px_1.5px_0px_0px_var(--border)]">{t("R")}</div>
                  <div>
                    <div className="text-sm font-black text-foreground mb-1">{t("Session ")}{r._id.slice(-5)}</div>
                    <div className="text-xs font-bold text-muted-foreground mb-2">{t("Score: ")}{r.overallScore?.toFixed(1) || '0.0'}</div>
                    <div className="inline-flex px-2.5 py-1 bg-accent text-accent-foreground border-2 border-border rounded-[var(--radius)] text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_var(--border)] shrink">
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
