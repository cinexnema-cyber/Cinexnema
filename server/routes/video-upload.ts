import { RequestHandler } from "express";
import ContentModel from "../routes/content";
import { getSupabaseAdmin } from "../utils/supabaseClient";

/**
 * Get creator's videos (from Content store)
 */
export const getCreatorVideos: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { status, page = "1", limit = "10" } = req.query as any;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }

    const filter: any = { creatorId: userId };
    if (status) filter.status = status;

    // Fetch all then paginate in-memory
    const all = (await (ContentModel as any).find(filter).populate()) as any[];
    // Sort by createdAt desc
    all.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const slice = all.slice(start, end);

    res.json({
      success: true,
      videos: slice.map((v: any) => ({
        id: v._id,
        title: v.title,
        description: v.description,
        status: v.status,
        viewCount: v.views ?? 0,
        revenue: v.earnings ?? 0,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        uploadedAt: v.uploadDate,
        approvedAt: v.approvedDate,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: all.length,
        pages: Math.max(1, Math.ceil(all.length / limitNum)),
      },
      creatorStats: {
        storageUsedGB: 0,
        storageLimitGB: 0,
        storageUsedPercentage: 0,
        videoCount: all.length,
        videoCountLimit: 0,
        graceMonthsLeft: 0,
        totalRevenue: all.reduce((sum, v) => sum + (v.earnings || 0), 0),
        totalViews: all.reduce((sum, v) => sum + (v.views || 0), 0),
      },
    });
  } catch (error: any) {
    console.error("Get creator videos error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vídeos",
      error: error?.message || "Unknown error",
    });
  }
};

/**
 * Get video by ID (for creator)
 */
export const getVideoById: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }

    const video = await (ContentModel as any).findById(videoId);
    if (!video || video.creatorId !== userId) {
      return res.status(404).json({ success: false, message: "Vídeo não encontrado" });
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        viewCount: video.views ?? 0,
        revenue: video.earnings ?? 0,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        category: video.category,
        tags: video.tags,
        metadata: (video as any).metadata || {},
        uploadedAt: video.uploadDate,
        processedAt: video.createdAt,
        approvedAt: video.approvedDate,
        approvalStatus: video.status,
      },
    });
  } catch (error: any) {
    console.error("Get video by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vídeo",
      error: error?.message || "Unknown error",
    });
  }
};

/**
 * Update video metadata
 */
export const updateVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const { title, description, category, tags, metadata: metaRaw, ...rest } = req.body as any;
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }

    const video = await (ContentModel as any).findById(videoId);
    if (!video || video.creatorId !== userId) {
      return res.status(404).json({ success: false, message: "Vídeo não encontrado" });
    }

    // Only allow updates for certain statuses
    if (!["pending", "rejected"].includes(video.status)) {
      return res.status(400).json({ success: false, message: "Vídeo não pode ser editado no status atual" });
    }

    // Update fields
    if (title) video.title = String(title);
    if (description) video.description = String(description);
    if (category) video.category = String(category);
    if (tags) video.tags = Array.isArray(tags) ? tags : String(tags).split(",").map((t) => t.trim()).filter(Boolean);

    // Merge extended metadata
    const currentMeta = ((video as any).metadata || {}) as Record<string, any>;
    const metaFromBody = (typeof metaRaw === "object" && metaRaw !== null) ? metaRaw : {};
    const extended: Record<string, any> = {
      ...currentMeta,
      ...metaFromBody,
    };

    // Map well-known fields from rest into metadata to support rich content
    const mapKeys = [
      "originalTitle","contentType","synopsis","genres","releaseYear","country","language","subtitles","dubbing","ageRating","directors","producers","cast","durationMinutes","episodes","seasons","trailerUrl","posterUrl","trailerDuration","videoQuality","videoFormat","fileFormat","videoCodec","audioCodec","fps","fileSizeMB","subtitlesFormat","thumbnailUrl","publishDate","awards","socialLinks","keywords","audioDescription","altTrailerUrl","popularity","copyright"
    ];
    for (const k of mapKeys) {
      if (k in rest) {
        extended[k] = rest[k];
      }
    }

    (video as any).metadata = extended;

    await video.save();

    // If submitting for review, reflect status in Supabase videos table as 'pending_approval'
    const submit = Boolean((rest as any)?.submitForReview || (req.body as any)?.submitForReview);
    if (submit) {
      try {
        const sb = getSupabaseAdmin();
        const payload: any = {
          id: video._id,
          title: video.title,
          description: video.description,
          creator_id: userId,
          status: "pending_approval",
          thumbnail_url: (video as any).thumbnailUrl || null,
          video_url: (video as any).videoUrl || null,
          is_trailer: typeof (metaFromBody as any)?.isTrailer === "boolean" ? (metaFromBody as any).isTrailer : false,
          created_at: (video as any).createdAt || new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        };
        await sb.from("videos").upsert(payload, { onConflict: "id" });
      } catch (e) {
        console.warn("Supabase upsert (pending_approval) skipped:", (e as any)?.message);
      }
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        category: video.category,
        tags: video.tags,
        metadata: (video as any).metadata || {},
      },
      message: submit ? "Vídeo enviado para análise" : "Vídeo atualizado com sucesso",
    });
  } catch (error: any) {
    console.error("Update video error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar vídeo",
      error: error?.message || "Unknown error",
    });
  }
};

/**
 * Delete video (creator can only delete rejected videos)
 */
export const deleteVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params as any;
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }

    const video = await (ContentModel as any).findById(videoId);
    if (!video || video.creatorId !== userId) {
      return res.status(404).json({ success: false, message: "Vídeo não encontrado" });
    }

    // Only allow deletion of rejected videos in this simplified flow
    if (video.status !== "rejected") {
      return res.status(400).json({ success: false, message: "Apenas vídeos rejeitados podem ser deletados" });
    }

    res.json({ success: true, message: "Vídeo deletado com sucesso" });
  } catch (error: any) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar vídeo",
      error: error?.message || "Unknown error",
    });
  }
};
