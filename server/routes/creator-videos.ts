import type { Request, Response } from "express";
import { authenticateToken, type AuthenticatedRequest } from "../middleware/auth";
import ContentModel from "./content";
import { getSupabaseAdmin } from "../utils/supabaseClient";

const API_BASE = "https://ws.api.video";

async function resolveApiVideoToken(userId?: string) {
  const envToken = process.env.API_VIDEO_API_KEY;
  if (envToken) return envToken;
  if (!userId) return null;
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb.from("users").select("apivideo_token").eq("id", userId).maybeSingle();
    return (data as any)?.apivideo_token || null;
  } catch {
    return null;
  }
}

function extractVodId(videoUrl?: string): string | null {
  if (!videoUrl) return null;
  // expected: https://embed.api.video/vod/{videoId}
  const m = videoUrl.match(/\/vod\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

export async function getCreatorVideosWithAnalytics(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    const period = String((req.query as any)?.period || "monthly");
    const type = String((req.query as any)?.type || "");
    if (!userId) return res.status(401).json({ success: false, message: "Usuário não autenticado" });

    // Fetch creator videos from local content store
    const all = (await (ContentModel as any).find({ creatorId: userId }).populate()) as any[];
    all.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    // Resolve api.video token
    const token = await resolveApiVideoToken(userId);

    // Optional filter: only 'realistic' videos (by tag/metadata/category heuristics)
    const base = all.filter((v) => {
      if (!type || type !== "realistic") return true;
      const tags = Array.isArray(v.tags) ? v.tags.map((t: any)=>String(t).toLowerCase()) : [];
      const cat = String(v.category || "").toLowerCase();
      const meta = ((v as any).metadata || {}) as any;
      const genres = Array.isArray(meta.genres) ? meta.genres.map((g: any)=>String(g).toLowerCase()) : [];
      return tags.includes("realista") || tags.includes("realistic") || genres.includes("realista") || genres.includes("realistic") || cat === "realistic" || cat === "realista";
    });

    const videos = await Promise.all(base.map(async (v) => {
      const vodId = extractVodId(v.videoUrl);
      let analytics: any = { views: 0, clicks: 0, watch_time: 0 };
      if (token && vodId) {
        try {
          const r = await fetch(`${API_BASE}/videos/${vodId}/analytics?period=${encodeURIComponent(period)}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          } as any);
          const j = await r.json().catch(() => ({}));
          if (r.ok && j) {
            const views = Number(j?.views || j?.viewCount || 0);
            const clicks = Number(j?.clicks || 0);
            const watch = Number(j?.watch_time || j?.watchTime || 0);
            analytics = { views, clicks, watch_time: watch };
          }
        } catch {}
      }
      return {
        id: v._id,
        title: v.title,
        description: v.description,
        status: v.status,
        uploadedAt: v.uploadDate,
        duration: v.duration,
        thumbnailUrl: v.thumbnailUrl,
        videoUrl: v.videoUrl,
        analytics,
      };
    }));

    return res.json({ success: true, period, videos });
  } catch (e: any) {
    console.error("creator.videos error:", e?.message || e);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
}
