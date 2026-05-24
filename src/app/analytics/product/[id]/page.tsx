"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Clock, 
  MessageSquare, Calendar, TrendingUp, TrendingDown,
  BrainCircuit, AlertCircle, Info, Sparkles,
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
    className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-[2rem] relative overflow-hidden group hover:border-primary/20 transition-all"
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      <Icon size={80} className="text-primary" />
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
          trend === 'increasing' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
          trend === 'decreasing' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
          'bg-white/5 text-slate-400 border-white/10'
        }`}>
          {trend === 'increasing' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend.toUpperCase()}
        </div>
      )}
    </div>
    <div className="text-4xl font-black text-white mb-1 tracking-tighter">{value}</div>
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subtext}</div>
  </motion.div>
);

interface Insight {
  priority: 'HIGH' | 'MEDIUM' | 'POSITIVE';
  title: string;
  text: string;
}

const InsightCard = ({ insight }: { insight: Insight }) => {
  const config = {
    HIGH: { border: "border-red-500/30", bg: "bg-red-500/5", iconColor: "text-red-400", label: "CRITICAL" },
    MEDIUM: { border: "border-amber-500/30", bg: "bg-amber-500/5", iconColor: "text-amber-400", label: "ADVISORY" },
    POSITIVE: { border: "border-green-500/30", bg: "bg-green-500/5", iconColor: "text-green-400", label: "POSITIVE" }
  };
  const { border, bg, iconColor, label } = config[insight.priority] || config.MEDIUM;

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
      className={`p-6 rounded-[2rem] border ${border} ${bg} relative overflow-hidden group`}
    >
      <div className="flex items-start gap-4">
        <div className={`h-10 w-10 rounded-xl bg-black/40 border ${border} flex items-center justify-center shrink-0`}>
          <Zap size={18} className={iconColor} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h4 className="text-sm font-black text-white tracking-wide">{insight.title}</h4>
             <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${border} ${iconColor} bg-black/20 tracking-widest`}>{label}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">{insight.text}</p>
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
    <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center gap-8">
      <div className="relative">
         <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
         <BrainCircuit size={64} className="text-primary animate-bounce relative z-10" />
      </div>
      <div className="text-center space-y-2">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Synchronizing Neural Data</div>
         <div className="text-xs text-slate-600 font-bold uppercase tracking-widest">Aggregating global telemetry logs</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <AlertCircle size={64} className="text-red-500 opacity-50" />
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white italic tracking-tighter">DATA LINK BROKEN</h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">{error || "Neural array telemetry not found."}</p>
      </div>
      <Link href="/dashboard"><Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-2xl px-8 h-14 font-black tracking-widest">RETURN TO BASE</Button></Link>
    </div>
  );

  const { product, stats, insights, mostAskedQuestions, historicalSessions } = data;
  const noData = stats.totalSessions === 0;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 relative overflow-hidden font-sans pb-32">
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-12 relative z-10 space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/10 text-slate-400 group">
                   <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">{product.name}</h1>
                   <StatBadge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black px-3 py-1 rounded-full">{product.type}</StatBadge>
                </div>
                <p className="text-sm text-slate-500 font-bold tracking-widest uppercase flex items-center gap-2">
                   <Activity size={14} className="text-primary" /> Intelligence Core Report
                </p>
              </div>
           </div>
           <div className="flex gap-4">
              <Link href={`/toolkit/${product._id}`}>
                <Button className="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-200">
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
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                       <Zap className="h-6 w-6 text-primary" /> Neural Insights
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Dynamic Analysis</span>
                 </div>
                 
                 {noData ? (
                   <div className="bg-white/[0.01] border border-white/[0.03] border-dashed rounded-[3rem] p-16 text-center">
                      <div className="h-16 w-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                         <AlertCircle className="h-8 w-8 text-slate-700" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest italic">Not enough data to generate insights</h3>
                      <p className="text-sm text-slate-700 mt-2 max-w-xs mx-auto">Initiate more live sessions to begin synthesis of behavioral patterns.</p>
                   </div>
                 ) : (
                   <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                   </motion.div>
                 )}
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={60} className="text-primary" />
                 </div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                       <Info size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">System Confidence Protocol</h3>
                 </div>
                 <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">{stats.confidenceExplanation}</p>
                 <div className="mt-8 flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Reliability</span>
                       <span className="text-sm font-black text-primary uppercase italic">{stats.totalSessions > 10 ? 'PRECISE' : stats.totalSessions > 3 ? 'STABLE' : 'ESTIMATING'}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Logic Node</span>
                       <span className="text-sm font-black text-slate-400">GPT-4 Matrix Core</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" /> Telemetry Ledger
                 </h2>
                 <div className="bg-white/[0.01] border border-white/[0.03] rounded-[3rem] overflow-hidden">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Node ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Persona</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Score</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Depth</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Access</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03]">
                             {historicalSessions.map((s) => (
                                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                                   <td className="px-8 py-6">
                                      <div className="flex flex-col">
                                         <span className="text-xs font-black text-white italic">{s._id.slice(-6).toUpperCase()}</span>
                                         <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(s.createdAt).toLocaleDateString()}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                                         s.visitorType === 'Buyer' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                                         s.visitorType === 'Interested' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
                                         'bg-white/5 border-white/10 text-slate-500'
                                      }`}>
                                         {s.visitorType}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className="text-base font-black text-white italic">{s.overallScore.toFixed(1)}</span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className="text-xs font-bold text-slate-500 underline decoration-primary/20 underline-offset-4">{fmtTime(s.interactionDuration)}</span>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <Link href={`/report/${s._id}`}>
                                         <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                                            <ArrowUpRight size={18} />
                                         </Button>
                                      </Link>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       {noData && (
                          <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 italic">No nodes logged in current ledger</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-12">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-8">
                 <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <BarChart size={20} className="text-green-400" /> Subject Classes
                 </h3>
                 <div className="space-y-6">
                    {[
                       { label: "STRONG BUYERS", pct: stats.strongBuyerPct, color: "bg-green-500" },
                       { label: "INTERESTED NODES", pct: stats.interestedPct, color: "bg-primary" },
                       { label: "EXPLORATORY ENTITIES", pct: stats.browsingPct, color: "bg-slate-600" }
                    ].map(item => (
                       <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-end">
                             <span className="text-[10px] font-black text-slate-500 tracking-widest">{item.label}</span>
                             <span className="text-sm font-black text-white">{item.pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                               className={`h-full ${item.color}`} 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative">
                 <div className="absolute -bottom-4 -right-4 opacity-5 rotate-12">
                    <MessageSquare size={120} className="text-primary" />
                 </div>
                 <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <MessageSquare size={20} className="text-purple-400" /> Core Inquiries
                 </h3>
                 <div className="space-y-4">
                    {mostAskedQuestions.map((q, i) => (
                       <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 group hover:border-purple-500/30 transition-all">
                          <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                             <span className="text-[10px] font-black text-purple-400">{q.count}x</span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-300 leading-normal line-clamp-2">{q.question}</span>
                       </div>
                    ))}
                    {mostAskedQuestions.length === 0 && (
                       <div className="py-6 text-center text-[10px] font-black uppercase text-slate-700 italic tracking-widest">Inquiry nodes empty</div>
                    )}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000" />
                 <h3 className="text-xl font-black text-white mb-8 italic tracking-tighter relative z-10">Neural Stability</h3>
                 <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse rounded-full" />
                    <div className="h-40 w-40 rounded-full border border-primary/20 flex items-center justify-center relative z-10">
                       <div className="h-32 w-32 rounded-full border-2 border-primary/40 border-dashed animate-[spin_20s_linear_infinite]" />
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-white italic tracking-tighter">{(stats.avgScore || 0).toFixed(1)}</span>
                          <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mt-1 italic">Vitals OK</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                       <span className="text-[8px] font-black text-slate-500 block uppercase mb-1">Verbal</span>
                       <span className="text-sm font-black text-white">{stats.avgVerbal?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                       <span className="text-[8px] font-black text-slate-500 block uppercase mb-1">Behaviour</span>
                       <span className="text-sm font-black text-white">{stats.avgBehavioural?.toFixed(1) || '0.0'}</span>
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
