import type { Request, Response } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

const API_BASE = "https://ws.api.video";

function extractVodId(videoUrl?: string): string | null {
  if (!videoUrl) return null;
  const m = videoUrl.match(/\/vod\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

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

export async function getCreatorMyVideos(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    const period = String((req.query as any)?.period || "monthly");
    if (!userId) return res.status(401).json({ success: false, message: "Usuário não autenticado" });

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("videos")
      .select("id, title, video_url, thumbnail_url, creator_id, status, rejection_reason, approval_status, created_at")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });

    const token = await resolveApiVideoToken(userId);

    const videos = await Promise.all((data || []).map(async (row: any) => {
      const vodId = extractVodId(row.video_url);
      let analytics: any = null;
      if (token && vodId && String(row.status) === "approved") {
        try {
          const r = await fetch(`${API_BASE}/videos/${vodId}/analytics?period=${encodeURIComponent(period)}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          } as any);
          const j = await r.json().catch(() => ({}));
          if (r.ok) analytics = j;
        } catch {}
      }
      const rejection = row?.rejection_reason || row?.approval_status?.rejectionReason || null;
      return {
        id: row.id,
        title: row.title,
        thumbnail: row.thumbnail_url,
        created_at: row.created_at,
        status: row.status,
        rejection_reason: rejection,
        videoUrl: row.video_url,
        analytics,
      };
    }));

    return res.json({ success: true, videos });
  } catch (e: any) {
    console.error("creator.my-videos error:", e?.message || e);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
}
