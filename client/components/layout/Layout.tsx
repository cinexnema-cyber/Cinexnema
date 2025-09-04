import { Header } from "./Header";
import { Footer } from "./Footer";
import TestPlatformBanner from "@/components/TestPlatformBanner";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) {
      // Persist for subscription attribution
      const videoIdMatch = location.pathname.match(/\/(watch|video)\/(\w[\w-]*)/i);
      const videoId = videoIdMatch ? videoIdMatch[2] : null;
      localStorage.setItem(
        "xnema_ref",
        JSON.stringify({ ref, videoId, at: Date.now() })
      );
      // Fire-and-forget view tracking
      const qs = new URLSearchParams({ ref, ...(videoId ? { videoId } : {}) });
      fetch(`/api/referrals/track-view?${qs.toString()}`).catch(() => {});
    }
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background">
      <TestPlatformBanner />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
