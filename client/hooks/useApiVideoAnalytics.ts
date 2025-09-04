import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface AnalyticsData {
  views: number;
  subscribers: number;
  revenue: number;
  videos: number;
  graceMonthsLeft: number;
  subscriptionRate: number;
  monthlyGrowth: number;
  loading: boolean;
}

interface CreatorVideoItem {
  id: string;
  title: string;
  status: string;
  views: number;
  revenue: number;
  uploadDate: string;
  duration: string;
  thumbnailUrl?: string | null;
  approvedAt?: string | null;
}

const formatDuration = (d: any): string => {
  if (typeof d === "number" && isFinite(d)) {
    // assume minutes when number
    return `${Math.max(0, Math.round(d))} min`;
  }
  if (typeof d === "string" && d.trim().length > 0) return d.trim();
  return "-";
};

export const useApiVideoAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    views: 0,
    subscribers: 0,
    revenue: 0,
    videos: 0,
    graceMonthsLeft: 0,
    subscriptionRate: 0,
    monthlyGrowth: 0,
    loading: true,
  });
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; views: number }[]>([]);
  const [viewsData, setViewsData] = useState<{ name: string; views: number; percentage: number }[]>([]);
  const [videosData, setVideosData] = useState<CreatorVideoItem[]>([]);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsData((p) => ({ ...p, loading: true }));
      if (!user) {
        setAnalyticsData((p) => ({ ...p, loading: false }));
        setVideosData([]);
        return;
      }
      const token = localStorage.getItem("xnema_token") || localStorage.getItem("token");
      if (!token) {
        setAnalyticsData((p) => ({ ...p, loading: false }));
        setVideosData([]);
        return;
      }
      // Fetch analytics with timeout and safe-parse
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 3000);
      const r = await fetch("/api/apivideo/analytics/me", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(to);
      let j: any = {};
      try { const t = await r.clone().text(); j = t ? JSON.parse(t) : {}; } catch {}
      const base = j?.data || { views: 0, subscribers: 0, revenue: 0, videos: 0 };
      setAnalyticsData({
        views: Number(base.views || 0),
        subscribers: Number(base.subscribers || 0),
        revenue: Number(base.revenue || 0),
        videos: Number(base.videos || 0),
        graceMonthsLeft: 0,
        subscriptionRate: 0,
        monthlyGrowth: 0,
        loading: false,
      });
      setRevenueData([]);
      setViewsData([]);
    } catch (e) {
      setAnalyticsData((p) => ({ ...p, loading: false }));
    }

    // Fetch creator videos
    try {
      if (!user) return;
      // Try legacy videos endpoint
      let arr: any[] = [];
      try {
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), 3000);
        const vr = await fetch(`/api/videos/creator/${encodeURIComponent(user.id)}?page=1&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(to);
        let vj: any = {};
        try { const t = await vr.clone().text(); vj = t ? JSON.parse(t) : {}; } catch {}
        arr = Array.isArray(vj?.videos) ? vj.videos : [];
      } catch {}
      // Fallback to Supabase-based endpoint
      if (!arr || arr.length === 0) {
        try {
          const controller2 = new AbortController();
          const to2 = setTimeout(() => controller2.abort(), 3000);
          const vr2 = await fetch(`/api/creators/${encodeURIComponent(user.id)}/videos`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller2.signal,
          });
          clearTimeout(to2);
          let vj2: any = {};
          try { const t2 = await vr2.clone().text(); vj2 = t2 ? JSON.parse(t2) : {}; } catch {}
          const supa = Array.isArray(vj2?.videos) ? vj2.videos : [];
          arr = supa.map((v: any) => ({
            id: v.id,
            title: v.title,
            status: v.status,
            viewCount: v.view_count || v.views || 0,
            revenue: v.revenue || 0,
            uploadedAt: v.created_at,
            duration: v.duration,
            thumbnailUrl: v.thumbnail_url || v.thumbnailUrl || null,
            approvedAt: v.approved_at || null,
          }));
        } catch {}
      }
      const mapped: CreatorVideoItem[] = (arr || []).map((v: any) => {
        const uploadedAt = v.uploadedAt || v.createdAt || null;
        const approvedAt = v.approvedAt || null;
        const uploadDate = uploadedAt ? new Date(uploadedAt).toLocaleDateString("pt-BR") : "";
        const status: string = String(v.status || "");
        return {
          id: String(v.id || v._id || ""),
          title: String(v.title || "Sem título"),
          status,
          views: Number(v.viewCount || v.views || 0),
          revenue: Number(v.revenue || v.earnings || 0),
          uploadDate,
          duration: formatDuration(v.duration),
          thumbnailUrl: v.thumbnailUrl || null,
          approvedAt: approvedAt ? new Date(approvedAt).toLocaleDateString("pt-BR") : null,
        };
      });
      setVideosData(mapped);
    } catch (e) {
      setVideosData([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAnalyticsData();
    const id = setInterval(fetchAnalyticsData, 15000);
    return () => clearInterval(id);
  }, [user]);

  return {
    analyticsData,
    revenueData,
    viewsData,
    videosData,
    trackPageView: (_: string) => {},
    trackVideoView: (_a: string, _b: string, _c?: string) => {},
    trackCreatorContent: (_a: string, _b: string, _c?: string) => {},
    refreshData: fetchAnalyticsData,
  };
};

export default useApiVideoAnalytics;
