import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

// Helpers to safely map possible column names from Supabase
function pick<T = any>(obj: any, keys: string[], fallback?: any): T | any {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
}

function mapVideoRow(row: any) {
  return {
    id: pick(row, ["id", "_id", "video_id"]) as string,
    title: pick(row, ["title", "nome", "name"]) || "",
    description: pick(row, ["description", "descricao"]) || "",
    status: pick(row, ["status"]) || "processing",
    creatorId: pick(row, ["creator_id", "creatorId", "user_id"]) || "",
    creatorName: pick(row, ["creator_name", "creatorName"]) || "",
    thumbnailUrl: pick(row, ["thumbnail_url", "thumbnailUrl"]) || undefined,
    duration: pick(row, ["duration"]) || undefined,
    fileSize: Number(pick(row, ["file_size", "fileSize"]) || 0),
    originalFilename: pick(row, ["original_filename", "originalFilename"]) || "",
    category: pick(row, ["category"]) || "",
    tags: (pick(row, ["tags"]) as string[] | null) || [],
    uploadedAt: pick(row, ["uploaded_at", "created_at", "uploadedAt", "createdAt"]) || new Date().toISOString(),
    processedAt: pick(row, ["processed_at", "processedAt"]) || undefined,
    viewCount: Number(pick(row, ["views", "viewCount"]) || 0),
    revenue: Number(pick(row, ["revenue_usd", "revenue"]) || 0),
    muxAssetId: pick(row, ["mux_asset_id", "muxAssetId"]) || null,
    muxPlaybackId: pick(row, ["mux_playback_id", "muxPlaybackId"]) || null,
  };
}

async function countByStatus(sb: any, status: string) {
  const { count, error } = await sb
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("status", status);
  if (error) return 0;
  return count || 0;
}

/**
 * Get all videos pending approval (admin only)
 */
export const getPendingVideos: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem acessar esta função.",
      });
    }

    const { page = 1, limit = 20 } = req.query as any;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let sb: any;
    try {
      sb = getSupabaseAdmin();
    } catch (e: any) {
      console.warn("Supabase not configured, returning empty pending videos:", e?.message);
      return res.json({ success: true, videos: [], pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 1 }, stats: { totalPending: 0 } });
    }

    // Fetch videos
    const { data, error } = await sb
      .from("videos")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      console.warn("Supabase getPendingVideos error:", error.message);
    }

    const totalPending = await countByStatus(sb, "pending_approval");
    const videos = (data || []).map(mapVideoRow);

    res.json({
      success: true,
      videos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalPending,
        pages: Math.max(1, Math.ceil(totalPending / Number(limit))),
      },
      stats: { totalPending },
    });
  } catch (error) {
    console.error("Get pending videos error:", error);
    return res.json({ success: true, videos: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 }, stats: { totalPending: 0 } });
  }
};

/**
 * Get all videos (admin only) with filters
 */
export const getAllVideos: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem acessar esta função.",
      });
    }

    const { status, creatorId, page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = req.query as any;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let sb: any;
    try {
      sb = getSupabaseAdmin();
    } catch (e: any) {
      console.warn("Supabase not configured, returning empty videos list:", e?.message);
      return res.json({ success: true, videos: [], pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 1 }, stats: {} });
    }
    let q = sb.from("videos").select("*");
    if (status) q = q.eq("status", status);
    if (creatorId) q = q.eq("creator_id", creatorId);

    const { data, error } = await q
      .order(String(sortBy), { ascending: String(sortOrder).toLowerCase() !== "desc" })
      .range(from, to);

    if (error) {
      console.warn("Supabase getAllVideos error:", error.message);
    }

    // Aggregate stats (best-effort)
    const statuses = ["pending_approval", "approved", "rejected", "processing"];
    const stats: any = {};
    for (const s of statuses) {
      stats[s] = { count: await countByStatus(sb, s) };
    }

    const total = (data || []).length;

    res.json({
      success: true,
      videos: (data || []).map(mapVideoRow),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.max(1, Math.ceil(total / Number(limit))),
      },
      stats,
    });
  } catch (error) {
    console.error("Get all videos error:", error);
    return res.json({ success: true, videos: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 }, stats: {} });
  }
};

/**
 * Approve video (admin only)
 */
export const approveVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const adminId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem aprovar vídeos.",
      });
    }

    const sb = getSupabaseAdmin();
    const { data: row, error } = await sb.from("videos").select("*").eq("id", videoId).single();
    if (error || !row) {
      return res.status(404).json({ success: false, message: "Vídeo não encontrado" });
    }

    if (row.status !== "pending_approval") {
      return res.status(400).json({ success: false, message: "Vídeo não está aguardando aprovação" });
    }

    const payloads = [
      { status: "approved", approved_at: new Date().toISOString(), approval_status: { approvedBy: adminId, approvedAt: new Date().toISOString() } },
      { status: "approved", approved_at: new Date().toISOString() },
      { status: "approved" },
    ];

    let updated: any = null;
    for (const p of payloads) {
      const { data: upd, error: updErr } = await sb.from("videos").update(p as any).eq("id", videoId).select("*").single();
      if (!updErr && upd) {
        updated = upd;
        break;
      }
    }

    if (!updated) {
      return res.status(500).json({ success: false, message: "Erro ao aprovar vídeo" });
    }

    // Best-effort: build public link to content page
    const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    const link = base ? `${base}/content/${updated.id}` : `/content/${updated.id}`;

    // Best-effort: notify creator via Supabase table 'notifications'
    try {
      const sb = getSupabaseAdmin();
      await sb.from("notifications").insert({
        user_id: updated.creator_id || updated.creatorId,
        type: "video_approved",
        message: `Seu vídeo foi aceito! Aqui está o link para divulgação e acompanhamento de analytics: ${link}`,
        link,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Notify creator skipped:", (e as any)?.message);
    }

    res.json({
      success: true,
      video: { id: updated.id, title: updated.title, status: updated.status, approvedAt: updated.approved_at, approvedBy: adminId },
      link_video: link,
      message: "Vídeo aprovado com sucesso",
    });
  } catch (error) {
    console.error("Approve video error:", error);
    res.status(500).json({ success: false, message: "Erro ao aprovar vídeo", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

/**
 * Reject video (admin only)
 */
export const rejectVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const { reason } = (req.body || {}) as any;
    const adminId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado. Apenas administradores podem rejeitar vídeos." });
    }

    if (!reason || String(reason).trim().length === 0) {
      return res.status(400).json({ success: false, message: "Motivo da rejeição é obrigatório" });
    }

    const sb = getSupabaseAdmin();
    const { data: row, error } = await sb.from("videos").select("*").eq("id", videoId).single();
    if (error || !row) {
      return res.status(404).json({ success: false, message: "Vídeo não encontrado" });
    }

    if (row.status !== "pending_approval") {
      return res.status(400).json({ success: false, message: "Vídeo não está aguardando aprovação" });
    }

    const payloads = [
      { status: "rejected", rejected_at: new Date().toISOString(), approval_status: { rejectedBy: adminId, rejectedAt: new Date().toISOString(), rejectionReason: String(reason).trim() } },
      { status: "rejected", rejected_at: new Date().toISOString() },
      { status: "rejected" },
    ];

    let updated: any = null;
    for (const p of payloads) {
      const { data: upd, error: updErr } = await sb.from("videos").update(p as any).eq("id", videoId).select("*").single();
      if (!updErr && upd) {
        updated = upd;
        break;
      }
    }

    if (!updated) {
      return res.status(500).json({ success: false, message: "Erro ao rejeitar vídeo" });
    }

    res.json({
      success: true,
      video: { id: updated.id, title: updated.title, status: updated.status, rejectedAt: updated.rejected_at, rejectedBy: adminId, rejectionReason: String(reason).trim() },
      message: "Vídeo rejeitado com sucesso",
    });
  } catch (error) {
    console.error("Reject video error:", error);
    res.status(500).json({ success: false, message: "Erro ao rejeitar vídeo", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

/**
 * Delete video (admin only)
 */
export const deleteVideoAdmin: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado. Apenas administradores podem deletar vídeos." });
    }

    const sb = getSupabaseAdmin();
    const { error } = await sb.from("videos").delete().eq("id", videoId);
    if (error) {
      return res.status(500).json({ success: false, message: "Erro ao deletar vídeo" });
    }

    res.json({ success: true, message: "Vídeo deletado com sucesso" });
  } catch (error) {
    console.error("Delete video (admin) error:", error);
    res.status(500).json({ success: false, message: "Erro ao deletar vídeo", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

/**
 * Get video details for admin review
 */
export const getVideoForReview: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado. Apenas administradores podem revisar vídeos." });
    }

    const sb = getSupabaseAdmin();
    const { data: row, error } = await sb.from("videos").select("*").eq("id", videoId).single();
    if (error || !row) {
      return res.status(404).json({ success: false, message: "Vídeo não encontrado" });
    }

    const video = mapVideoRow(row);

    // Best-effort: additional creator info may not exist in Supabase
    const creatorInfo = null;

    res.json({ success: true, video, creatorInfo });
  } catch (error) {
    console.error("Get video for review error:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar detalhes do vídeo", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado. Apenas administradores podem acessar estatísticas." });
    }

    const sb = getSupabaseAdmin();

    const statuses = ["pending_approval", "approved", "rejected", "processing"];
    const stats: any = {};
    for (const s of statuses) {
      stats[s] = { count: await countByStatus(sb, s) };
    }

    // Recent activity (best-effort)
    const { data: recent } = await sb
      .from("videos")
      .select("title, creator_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    const pendingCount = stats["pending_approval"].count;

    res.json({
      success: true,
      stats: {
        videos: stats,
        creators: {
          totalCreators: 0,
          totalStorageUsed: 0,
          totalVideoCount: 0,
          gracePeriodCreators: 0,
        },
        pending: { videos: pendingCount },
      },
      recentActivity: recent || [],
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar estatísticas", error: error instanceof Error ? error.message : "Unknown error" });
  }
};
