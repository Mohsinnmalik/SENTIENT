"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Users, Globe2, Loader2, Link as IconLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GlobalStats {
  totalUsers: number;
  totalSessions: number;
  conversionRate: string;
  averageEngagement: string;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGlobalStats = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("sentient_token") || "";
    try {
      const res = await fetch("/api/analytics/global", { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setGlobalStats(data.data);
      }
    } catch {
      // recovery
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchGlobalStats();
    }
  }, [authLoading, user, fetchGlobalStats]);

  if (authLoading || (!user)) return null;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-8 flex items-center gap-4 text-white">
          <Globe2 className="h-8 w-8 text-primary" />
          Global Neural Analytics
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
               <Users className="h-8 w-8 text-blue-400 mx-auto mb-4" />
               <div className="text-sm font-black uppercase text-slate-500 tracking-widest mb-2">Total System Users</div>
               <div className="text-5xl font-black text-white">{globalStats?.totalUsers || 0}</div>
             </div>
             
             <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
               <Activity className="h-8 w-8 text-green-400 mx-auto mb-4" />
               <div className="text-sm font-black uppercase text-slate-500 tracking-widest mb-2">Total Sessions</div>
               <div className="text-5xl font-black text-white">{globalStats?.totalSessions || 0}</div>
             </div>

             <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
               <IconLink className="h-8 w-8 text-purple-400 mx-auto mb-4" />
               <div className="text-sm font-black uppercase text-slate-500 tracking-widest mb-2">Conversion Rate</div>
               <div className="text-5xl font-black text-white">{globalStats?.conversionRate || "0%"}</div>
             </div>

             <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
               <Activity className="h-8 w-8 text-primary mx-auto mb-4" />
               <div className="text-sm font-black uppercase text-slate-500 tracking-widest mb-2">Avg Engagement</div>
               <div className="text-5xl font-black text-white">{globalStats?.averageEngagement || "0.0"}</div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
