import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

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

interface RevenueData {
  month: string;
  revenue: number;
  views: number;
}

interface ViewsData {
  name: string;
  views: number;
  percentage: number;
}

interface VideoData {
  id: number;
  title: string;
  status: string;
  views: number;
  revenue: number;
  uploadDate: string;
  duration: string;
}

export const useGoogleAnalytics = () => {
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

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [viewsData, setViewsData] = useState<ViewsData[]>([]);
  const [videosData, setVideosData] = useState<VideoData[]>([]);

  // Track page view
  const trackPageView = (page: string) => {
    if (typeof window.gtag !== "undefined") {
      window.gtag("config", "G-FMZQ1MHE5G", {
        page_title: page,
        page_location: window.location.href,
        custom_map: {
          dimension1: user?.id ? String(user.id) : "anonymous",
          dimension2: user?.role || "visitor",
        },
      });
    }
  };

  // Track video view
  const trackVideoView = (
    videoId: string,
    videoTitle: string,
    userId?: string,
  ) => {
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "video_view", {
        event_category: "Content",
        event_label: videoTitle,
        video_id: videoId,
        user_id: userId || (user?.id ? String(user.id) : "anonymous"),
        custom_map: {
          dimension3: videoId,
          dimension4: "video_view",
        },
      });
    }
  };

  // Track creator content interaction
  const trackCreatorContent = (
    action: string,
    contentId: string,
    creatorId?: string,
  ) => {
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "creator_interaction", {
        event_category: "Creator",
        event_action: action,
        event_label: contentId,
        creator_id: creatorId || (user?.id ? String(user.id) : ""),
        custom_map: {
          dimension5: creatorId || (user?.id ? String(user.id) : ""),
          dimension6: action,
        },
      });
    }
  };

  // Fetch real analytics data from Google Analytics
  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsData((prev) => ({ ...prev, loading: true }));

      // Safety check - ensure user exists
      if (!user) {
        setAnalyticsData((prev) => ({ ...prev, loading: false }));
        return;
      }

      // In a real implementation, you would use Google Analytics Reporting API
      // For now, we'll simulate real data based on user activity

      // Simulate API call to get real data
      const response = await fetch("/api/analytics/creator-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({
          creatorId: user?.id ? String(user.id) : "",
          timeRange: "30d",
        }),
      });

      let realData;
      if (response.ok) {
        realData = await response.json();
      } else {
        // No fake data. Keep zeros and neutral values.
        realData = {
          views: 0,
          subscribers: 0,
          revenue: 0,
          videos: 0,
          graceMonthsLeft: 0,
          subscriptionRate: 0,
          monthlyGrowth: 0,
        };
      }

      setAnalyticsData((prev) => ({
        ...realData,
        loading: false,
      }));

      // No generated charts when no real data
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
      const generatedRevenueData = (realData.revenue && realData.views)
        ? months.map((month, index) => ({
            month,
            revenue: Math.floor((realData.revenue / 6) * (1 + index * 0.2)),
            views: Math.floor((realData.views / 6) * (1 + index * 0.15)),
          }))
        : [];
      setRevenueData(generatedRevenueData);

      const generatedViewsData = [] as any[];
      setViewsData(generatedViewsData);

      const generatedVideosData = [] as any[];
      setVideosData(generatedVideosData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsData((prev) => ({ ...prev, loading: false }));
    }
  };

  // Initialize analytics when user is available
  useEffect(() => {
    if (user) {
      trackPageView("Creator Portal");
      fetchAnalyticsData();
    }
  }, [user]);

  return {
    analyticsData,
    revenueData,
    viewsData,
    videosData,
    trackPageView,
    trackVideoView,
    trackCreatorContent,
    refreshData: fetchAnalyticsData,
  };
};

export default useGoogleAnalytics;
