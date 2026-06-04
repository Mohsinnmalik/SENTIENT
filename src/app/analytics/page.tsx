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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-16 relative z-10">
        <h1 className="text-4xl font-black mb-12 flex items-center gap-4 text-foreground">
          <Globe2 className="h-8 w-8 text-primary" />
          Global Neural Analytics
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-card border-3 border-border p-8 rounded-[var(--radius)] text-center shadow-[4px_4px_0px_0px_var(--border)]">
               <Users className="h-8 w-8 text-[#00f0ff] mx-auto mb-4" />
               <div className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Total System Users</div>
               <div className="text-5xl font-black text-foreground">{globalStats?.totalUsers || 0}</div>
             </div>
             
             <div className="bg-card border-3 border-border p-8 rounded-[var(--radius)] text-center shadow-[4px_4px_0px_0px_var(--border)]">
               <Activity className="h-8 w-8 text-[#2ee59d] mx-auto mb-4" />
               <div className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Total Sessions</div>
               <div className="text-5xl font-black text-foreground">{globalStats?.totalSessions || 0}</div>
             </div>

             <div className="bg-card border-3 border-border p-8 rounded-[var(--radius)] text-center shadow-[4px_4px_0px_0px_var(--border)]">
               <IconLink className="h-8 w-8 text-[#ff007a] mx-auto mb-4" />
               <div className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Conversion Rate</div>
               <div className="text-5xl font-black text-foreground">{globalStats?.conversionRate || "0%"}</div>
             </div>

             <div className="bg-card border-3 border-border p-8 rounded-[var(--radius)] text-center shadow-[4px_4px_0px_0px_var(--border)]">
               <Activity className="h-8 w-8 text-primary mx-auto mb-4" />
               <div className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Avg Engagement</div>
               <div className="text-5xl font-black text-foreground">{globalStats?.averageEngagement || "0.0"}</div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
