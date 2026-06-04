"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Clock, 
  MessageSquare, Calendar, TrendingUp, TrendingDown,
  AlertCircle, Info, Sparkles,
  Target, ShieldCheck, Zap, ArrowUpRight, BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────

interface KPIBlockProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  trend?: 'increasing' | 'decreasing' | 'stable';
}
const KPIBlock = ({ label, value, subtext, icon: Icon, trend }: KPIBlockProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-card border-3 border-border p-6 rounded-[var(--radius)] relative overflow-hidden group shadow-[4px_4px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all duration-150"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={80} className="text-secondary" />
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-[var(--radius)] border-2 border-border ${
          trend === 'increasing' ? 'bg-[#2ee59d] text-black shadow-[1px_1px_0px_0px_var(--border)]' : 
          trend === 'decreasing' ? 'bg-destructive text-destructive-foreground shadow-[1px_1px_0px_0px_var(--border)]' : 
          'bg-muted text-muted-foreground shadow-[1px_1px_0px_0px_var(--border)]'
        }`}>
          {trend === 'increasing' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend.toUpperCase()}
        </div>
      )}
    </div>
    <div className="text-4xl font-black text-foreground mb-1 tracking-tighter">{value}</div>
    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{subtext}</div>
  </motion.div>
);

interface Insight {
  priority: 'HIGH' | 'MEDIUM' | 'POSITIVE';
  title: string;
  text: string;
}

const InsightCard = ({ insight }: { insight: Insight }) => {
  const config = {
    HIGH: { border: "border-destructive", bg: "bg-destructive/10 text-red-900", iconColor: "text-destructive", label: "CRITICAL" },
    MEDIUM: { border: "border-amber-500", bg: "bg-amber-500/10 text-amber-900", iconColor: "text-amber-600", label: "ADVISORY" },
    POSITIVE: { border: "border-[#2ee59d]", bg: "bg-[#2ee59d]/10 text-emerald-950", iconColor: "text-emerald-600", label: "POSITIVE" }
  };
  const { border, bg, iconColor, label } = config[insight.priority] || config.MEDIUM;

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
      className={`p-6 rounded-[var(--radius)] border-3 shadow-[3px_3px_0px_0px_var(--border)] relative overflow-hidden group ${border} ${bg}`}
    >
      <div className="flex items-start gap-4">
        <div className={`h-10 w-10 rounded-[var(--radius)] bg-card border-2 border-border flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_var(--border)]`}>
          <Zap size={18} className={iconColor} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h4 className="text-sm font-black text-foreground tracking-wide">{insight.title}</h4>
             <span className={`text-[8px] font-black px-2 py-0.5 rounded-[var(--radius)] border-2 border-border ${iconColor} bg-card tracking-widest shadow-[1px_1px_0px_0px_var(--border)]`}>{label}</span>
          </div>
          <p className="text-xs font-bold leading-relaxed">{insight.text}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface HistoricalSession {
  _id: string;
  createdAt: string;
  visitorType: string;
  overallScore: number;
  interactionDuration: number;
}

interface AnalyticsData {
  product: {
    _id: string;
    name: string;
    type: string;
    description: string;
  };
  stats: {
    totalSessions: number;
    avgScore: number;
    avgVerbal: number;
    avgBehavioural: number;
    avgDuration: number;
    strongBuyerPct: number;
    interestedPct: number;
    browsingPct: number;
    conversionRate: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidenceExplanation: string;
  };
  insights: Insight[];
  mostAskedQuestions: Array<{ question: string; count: number }>;
  historicalSessions: HistoricalSession[];
}

export default function PremiumAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sentient_token") || "";
      const res = await fetch(`/api/analytics/product/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setData(result.data);
      else throw new Error(result.message || "Failed to retrieve array metrics");
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message);
      toast.error(errorObj.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}m ${Math.floor(s % 60)}s`;
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 text-foreground">
      <div className="relative">
         <div className="h-16 w-16 rounded-[var(--radius)] bg-white border-3 border-border shadow-[4px_4px_0px_0px_var(--border)] overflow-hidden animate-bounce flex items-center justify-center">
            <Image src="/logo.png" alt="SENTIENT Logo" width={64} height={64} className="h-full w-full object-cover" />
         </div>
      </div>
      <div className="text-center space-y-2">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff007a] animate-pulse">Synchronizing Neural Data</div>
         <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Aggregating global telemetry logs</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6 text-foreground">
      <AlertCircle size={64} className="text-destructive" />
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-foreground italic tracking-tighter">DATA LINK BROKEN</h2>
        <p className="text-muted-foreground max-w-sm mx-auto font-medium">{error || "Neural array telemetry not found."}</p>
      </div>
      <Link href="/dashboard"><Button variant="outline" className="px-8 h-14 font-black tracking-widest">RETURN TO BASE</Button></Link>
    </div>
  );

  const { product, stats, insights, mostAskedQuestions, historicalSessions } = data;
  const noData = stats.totalSessions === 0;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans pb-32">
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-12 relative z-10 space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-3 border-border pb-8">
           <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="h-14 w-14 text-foreground">
                   <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-4xl md:text-5xl font-black text-foreground italic tracking-tighter">{product.name}</h1>
                   <StatBadge className="bg-primary text-primary-foreground border-2 border-border text-[10px] font-black px-3 py-1 rounded shadow-[1.5px_1.5px_0px_0px_var(--border)]">{product.type}</StatBadge>
                </div>
                <p className="text-sm text-muted-foreground font-bold tracking-widest uppercase flex items-center gap-2">
                   <Activity size={14} className="text-[#ff007a]" /> Intelligence Core Report
                </p>
              </div>
           </div>
           <div className="flex gap-4">
              <Link href={`/toolkit/${product._id}`}>
                <Button className="h-14 px-8 bg-[#ff007a] text-white border-3 border-border shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all font-black uppercase text-xs tracking-[0.2em]">
                  <Sparkles size={16} className="mr-2" /> REBOOT MATRIX
                </Button>
              </Link>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <KPIBlock label="Engagement Quotient" value={stats.totalSessions} subtext="Total captured nodes" icon={Activity} />
           <KPIBlock label="Sentiment Index" value={stats.avgScore?.toFixed(1) || "0.0"} subtext="Composite score /10" icon={TrendingUp} trend={stats.trend} />
           <KPIBlock label="Conversation Conversion" value={`${stats.conversionRate}%`} subtext="High intent sessions" icon={Target} />
           <KPIBlock label="Avg Connection Time" value={fmtTime(stats.avgDuration)} subtext="Telemetric session depth" icon={Clock} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-12">
              <div className="space-y-8">
                 <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                       <Zap className="h-6 w-6 text-primary" /> Neural Insights
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dynamic Analysis</span>
                 </div>
                 
                 {noData ? (
                   <div className="bg-card border-3 border-dashed border-border rounded-[var(--radius)] p-16 text-center shadow-[4px_4px_0px_0px_var(--border)]">
                      <div className="h-16 w-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-6 border-2 border-border">
                         <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Not enough data to generate insights</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Initiate more live sessions to begin synthesis of behavioral patterns.</p>
                   </div>
                 ) : (
                   <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                   </motion.div>
                 )}
              </div>

              <div className="bg-card border-3 border-border rounded-[var(--radius)] p-10 relative overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
                 <div className="absolute top-0 right-0 p-10 opacity-5">
                    <ShieldCheck size={60} className="text-[#ffe600]" />
                 </div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-[var(--radius)] bg-primary text-primary-foreground flex items-center justify-center border-2 border-border shadow-[1.5px_1.5px_0px_0px_var(--border)]">
                       <Info size={18} />
                    </div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">System Confidence Protocol</h3>
                 </div>
                 <p className="text-muted-foreground font-bold leading-relaxed max-w-2xl">{stats.confidenceExplanation}</p>
                 <div className="mt-8 flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reliability</span>
                       <span className="text-sm font-black text-[#ff007a] uppercase italic">{stats.totalSessions > 10 ? 'PRECISE' : stats.totalSessions > 3 ? 'STABLE' : 'ESTIMATING'}</span>
                    </div>
                    <div className="h-8 w-[2px] bg-border" />
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Logic Node</span>
                       <span className="text-sm font-black text-foreground">GPT-4 Matrix Core</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" /> Telemetry Ledger
                 </h2>
                 <div className="bg-card border-3 border-border rounded-[var(--radius)] overflow-hidden shadow-[4px_4px_0px_0px_var(--border)]">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-muted border-b-3 border-border">
                                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground">Node ID</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground">Persona</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground">Score</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground">Depth</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground text-right">Access</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-border">
                             {historicalSessions.map((s) => (
                                <tr key={s._id} className="hover:bg-muted/50 transition-colors group">
                                   <td className="px-8 py-6">
                                      <div className="flex flex-col">
                                         <span className="text-xs font-black text-foreground italic">{s._id.slice(-6).toUpperCase()}</span>
                                         <span className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(s.createdAt).toLocaleDateString()}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className={`px-2.5 py-1 rounded-[var(--radius)] text-[8px] font-black uppercase tracking-widest border-2 border-border shadow-[1px_1px_0px_0px_var(--border)] ${
                                         s.visitorType === 'Buyer' ? 'bg-[#2ee59d] text-black' : 
                                         s.visitorType === 'Interested' ? 'bg-[#00f0ff] text-black' : 
                                         'bg-card text-foreground'
                                      }`}>
                                         {s.visitorType}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className="text-base font-black text-foreground italic">{s.overallScore.toFixed(1)}</span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className="text-xs font-bold text-muted-foreground underline decoration-primary/50 underline-offset-4">{fmtTime(s.interactionDuration)}</span>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <Link href={`/report/${s._id}`}>
                                         <Button variant="outline" size="icon" className="h-9 w-9 text-foreground">
                                            <ArrowUpRight size={18} />
                                         </Button>
                                      </Link>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       {noData && (
                          <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">No nodes logged in current ledger</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-12">
              <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 space-y-8 shadow-[4px_4px_0px_0px_var(--border)]">
                 <h3 className="text-lg font-black text-foreground flex items-center gap-3">
                    <BarChart size={20} className="text-[#2ee59d]" /> Subject Classes
                 </h3>
                 <div className="space-y-6">
                    {[
                       { label: "STRONG BUYERS", pct: stats.strongBuyerPct, color: "bg-[#2ee59d]" },
                       { label: "INTERESTED NODES", pct: stats.interestedPct, color: "bg-[#ffe600]" },
                       { label: "EXPLORATORY ENTITIES", pct: stats.browsingPct, color: "bg-muted-foreground" }
                    ].map(item => (
                       <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-end">
                             <span className="text-[10px] font-black text-muted-foreground tracking-widest">{item.label}</span>
                             <span className="text-sm font-black text-foreground">{item.pct}%</span>
                          </div>
                          <div className="h-4 w-full bg-muted rounded-[var(--radius)] overflow-hidden border-2 border-border">
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                               className={`h-full ${item.color}`} 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-card border-3 border-border rounded-[var(--radius)] p-8 space-y-8 overflow-hidden relative shadow-[4px_4px_0px_0px_var(--border)]">
                 <h3 className="text-lg font-black text-foreground flex items-center gap-3">
                    <MessageSquare size={20} className="text-[#ff007a]" /> Core Inquiries
                 </h3>
                 <div className="space-y-4">
                    {mostAskedQuestions.map((q, i) => (
                       <div key={i} className="p-4 rounded-[var(--radius)] bg-card border-2 border-border flex gap-4 hover:bg-muted transition-all shadow-[2px_2px_0px_0px_var(--border)]">
                          <div className="h-8 w-8 rounded-sm bg-[#ff007a] text-white border border-border flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_var(--border)]">
                             <span className="text-[10px] font-black">{q.count}x</span>
                          </div>
                          <span className="text-[11px] font-bold text-foreground leading-normal line-clamp-2">{q.question}</span>
                       </div>
                    ))}
                    {mostAskedQuestions.length === 0 && (
                       <div className="py-6 text-center text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">Inquiry nodes empty</div>
                    )}
                 </div>
              </div>

              <div className="bg-card border-3 border-border rounded-[var(--radius)] p-10 text-center relative overflow-hidden group shadow-[4px_4px_0px_0px_var(--border)]">
                 <h3 className="text-xl font-black text-foreground mb-8 italic tracking-tighter relative z-10">Neural Stability</h3>
                 <div className="relative flex items-center justify-center mb-8">
                    <div className="h-40 w-40 rounded-full border-3 border-border flex items-center justify-center relative z-10 bg-card">
                       <div className="h-32 w-32 rounded-full border-3 border-primary border-dashed animate-[spin_20s_linear_infinite]" />
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-foreground italic tracking-tighter">{(stats.avgScore || 0).toFixed(1)}</span>
                          <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-1 italic">Vitals OK</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-3 rounded-[var(--radius)] bg-card border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                       <span className="text-[8px] font-black text-muted-foreground block uppercase mb-1">Verbal</span>
                       <span className="text-sm font-black text-foreground">{stats.avgVerbal?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="p-3 rounded-[var(--radius)] bg-card border-2 border-border shadow-[2px_2px_0px_0px_var(--border)]">
                       <span className="text-[8px] font-black text-muted-foreground block uppercase mb-1">Behaviour</span>
                       <span className="text-sm font-black text-foreground">{stats.avgBehavioural?.toFixed(1) || '0.0'}</span>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}

const StatBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${className || ''}`}>{children}</span>;
