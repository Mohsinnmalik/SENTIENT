"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  subtext?: string;
}

const StatCard = ({ label, value, icon: Icon, subtext }: StatCardProps) => (
  <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/[0.04] transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="h-12 w-12 text-primary" />
    </div>
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    {subtext && <div className="text-[10px] font-bold text-slate-400">{subtext}</div>}
  </div>
);

export default function ProductAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sentient_token") || "";
      const res = await fetch(`/api/analytics/product/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch analytics");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Aggregating Product Intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#04060f] flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Analysis Link Severed</h2>
        <p className="text-slate-400 mb-8 max-w-md">{error || "The requested data matrix could not be assembled."}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Command Center
          </Button>
        </Link>
      </div>
    );
  }

  const { product, stats, historicalSessions, mostAskedQuestions } = data;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200 selection:bg-primary/30 relative overflow-hidden font-sans pb-24">
      {/* Background Neural Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 relative z-10 space-y-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/10 text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Intelligence Report</div>
              <h1 className="text-4xl font-black text-white tracking-tight">{product.name}</h1>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
             <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
               ID: {product._id.slice(-8)}
             </div>
             <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-widest text-green-400">
               Live Array
             </div>
          </div>
        </div>

        {/* Global Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Interactions" 
            value={stats.totalSessions} 
            icon={Activity} 
            subtext="Unique sessions recorded"
          />
          <StatCard 
            label="Avg. Session Depth" 
            value={stats.averageScore?.toFixed(1) || "0.0"} 
            icon={BarChart3} 
            subtext="Out of 10.0 sentiment score"
          />
          <StatCard 
            label="Avg. Engagement Time" 
            value={formatDuration(stats.averageDuration || 0)} 
            icon={Clock} 
            subtext="Active user monitoring"
          />
          <StatCard 
            label="Neural Integrity" 
            value="High" 
            icon={TrendingUp} 
            subtext="Telemetry sync stable"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Historial Ledger (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                Interaction Ledger
              </h2>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Showing {historicalSessions.length} sessions
              </div>
            </div>

            <div className="space-y-4">
              {historicalSessions.map((session: any) => (
                <div key={session._id} className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white mb-1 flex items-center gap-2">
                          Session #{session._id.slice(-6).toUpperCase()}
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            session.visitorType === 'Buyer' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            session.visitorType === 'Interested' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            'bg-slate-500/10 border-slate-500/20 text-slate-400'
                          }`}>
                            {session.visitorType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mb-3">{formatDate(session.createdAt)}</div>
                        <p className="text-sm text-slate-400 line-clamp-2 italic leading-relaxed">
                          "{session.summary || 'No summary synthesized for this interaction block.'}"
                        </p>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-between items-end gap-2 md:w-32">
                       <div className="text-right">
                         <div className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Score</div>
                         <div className="text-xl font-black text-white">{session.overallScore?.toFixed(1)}</div>
                       </div>
                       <div className="text-right">
                         <div className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Duration</div>
                         <div className="text-sm font-bold text-slate-400">{formatDuration(session.interactionDuration)}</div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}

              {historicalSessions.length === 0 && (
                <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                   <Activity className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-slate-400">Ledger is empty</h3>
                   <p className="text-slate-600 text-sm">Initiate a live session to begin recording telemetry.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Insights & Distribution (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Buyer Distribution */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-8">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                Target Alignment
              </h3>
              
              <div className="space-y-6">
                {[
                  { label: "Strong Buyers", pct: stats.strongBuyerPct, color: "bg-green-500" },
                  { label: "Interested Nodes", pct: stats.interestedPct, color: "bg-blue-500" },
                  { label: "Casual Browsers", pct: stats.browsingPct, color: "bg-slate-600" }
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Asked Questions */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Frequent Inquiries
              </h3>
              
              <div className="space-y-3">
                {mostAskedQuestions.map((q: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#04060f] border border-white/5 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                    <span className="text-xs font-medium text-slate-300 line-clamp-1">{q.question}</span>
                    <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-black">{q.count}</span>
                  </div>
                ))}
                {mostAskedQuestions.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-4">Insufficient question data detected.</p>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-br from-primary/20 to-indigo-900/10 border border-primary/20 rounded-[2.5rem] p-8 text-center group">
               <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-8 w-8 text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
               </div>
               <h3 className="text-xl font-black text-white mb-2">Simulate Subject?</h3>
               <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                 Launch the live interface to collect higher fidelity telemetry from a new subject node.
               </p>
               <Link href={`/toolkit/${product._id}`}>
                 <Button className="w-full rounded-2xl h-14 bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200 shadow-xl shadow-primary/10">
                   INITIATE MATRIX
                 </Button>
               </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
