import type { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getSupabaseAdmin } from "../utils/supabaseClient";
import ContentModel from "./content";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "apivideo");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const apivideoUpload = multer({ storage });

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

export const createVideo: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    const token = await resolveApiVideoToken(userId);
    if (!token) return res.status(400).json({ success: false, message: "CONFIG_MISSING: API_VIDEO_API_KEY or users.apivideo_token" });

    const { title, description, category, tags, transcript, transcriptSummary, transcriptSummaryAttributes } = req.body as any;
    if (!title || !description) return res.status(400).json({ success: false, message: "Título e descrição são obrigatórios" });

    const createPayload: any = { title, description, public: false };
    if (typeof transcript !== "undefined") createPayload.transcript = Boolean(transcript);
    if (typeof transcriptSummary !== "undefined") createPayload.transcriptSummary = Boolean(transcriptSummary);
    if (Array.isArray(transcriptSummaryAttributes)) createPayload.transcriptSummaryAttributes = transcriptSummaryAttributes.filter(Boolean);

    const resp = await fetch(`${API_BASE}/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(createPayload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, message: data?.message || "Falha ao criar vídeo", error: data });
    }

    const videoId = data?.videoId || data?.video?.videoId;
    if (!videoId) return res.status(500).json({ success: false, message: "Resposta inválida da api.video" });

    // Create local content record (pending)
    const content = new (ContentModel as any)({
      title,
      description,
      category: category || "geral",
      tags: Array.isArray(tags) ? tags : String(tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
      creatorId: userId,
      status: "pending",
      videoUrl: `https://embed.api.video/vod/${videoId}`,
      thumbnailUrl: `https://cdn.api.video/vod/${videoId}/thumbnail.jpg`,
      muxAssetId: null,
      muxPlaybackId: null,
      muxUploadId: null,
    } as any);
    await content.save();

    // Best effort persist to Supabase
    try {
      const sb = getSupabaseAdmin();
      await sb.from("content").upsert({
        id: content._id,
        title: content.title,
        description: content.description,
        category: content.category,
        tags: content.tags,
        creator_id: content.creatorId,
        status: content.status,
        video_url: content.videoUrl,
        thumbnail_url: content.thumbnailUrl,
        created_at: content.createdAt,
        upload_date: new Date(),
      }, { onConflict: "id" });
    } catch (e) {
      console.warn("Supabase save skipped (apivideo.create):", (e as any)?.message);
    }

    try {
      const { sendEmail } = require("../utils/email");
      await sendEmail({
        to: "cinexnema@gmail.com",
        subject: "Novo vídeo enviado (api.video)",
        html: `<p>Um criador enviou um novo vídeo.</p><p>Título: <b>${title}</b></p><p>ContentID: ${String(content._id)}</p><p>VideoId: ${videoId}</p><p><a href="${(process.env.FRONTEND_URL||"https://cinexnema.com").replace(/\/$/,"")}/video-approval" target="_blank">Abrir Aprovação</a></p>`
      });
    } catch (e) {
      console.warn("Email notify skipped:", (e as any)?.message || e);
    }

    res.json({ success: true, videoId, contentId: content._id });
  } catch (e: any) {
    console.error("apivideo.create error:", e);
    res.status(500).json({ success: false, message: "Erro interno do servidor", error: e?.message || String(e) });
  }
};

export const uploadSource: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const token = await resolveApiVideoToken(userId);
    const { videoId } = req.params as any;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!token) return res.status(400).json({ success: false, message: "CONFIG_MISSING: API_VIDEO_API_KEY or users.apivideo_token" });
    if (!videoId) return res.status(400).json({ success: false, message: "videoId é obrigatório" });
    if (!file) return res.status(400).json({ success: false, message: "Arquivo não enviado" });

    const buf = fs.readFileSync(file.path);
    const blob = new Blob([buf], { type: file.mimetype || "application/octet-stream" });
    const form = new FormData();
    form.append("file", blob, file.originalname || "video.mp4");

    const resp = await fetch(`${API_BASE}/videos/${videoId}/source`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form as any,
    });

    // Safely capture response body as text and attempt JSON parse for better error reporting
    const raw = await resp.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    // Cleanup temp file
    try { file.path && fs.existsSync(file.path) && fs.unlinkSync(file.path); } catch {}

    if (!resp.ok) {
      const msg = data?.message || data?.error || (raw && raw.slice(0, 300)) || `Falha no upload para api.video (status ${resp.status})`;
      return res.status(resp.status).json({ success: false, message: msg, error: data?.error || raw || null });
    }

    res.json({ success: true, video: Object.keys(data).length ? data : raw });
  } catch (e: any) {
    console.error("apivideo.upload error:", e);
    res.status(500).json({ success: false, message: "Erro interno do servidor", error: e?.message || String(e) });
  }
};

export const getMyAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ success: false, message: "Usuário não autenticado" });

    // Resolve token (user-specific or env fallback)
    const token = await resolveApiVideoToken(userId);
    if (!token) {
      return res.json({ success: true, data: { views: 0, subscribers: 0, revenue: 0, videos: 0 } });
    }

    const resp = await fetch(`${API_BASE}/videos`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    let views = 0; let videos = 0;
    if (resp.ok) {
      const j = await resp.json();
      videos = Array.isArray(j?.data) ? j.data.length : 0;
    }

    res.json({ success: true, data: { views, subscribers: 0, revenue: 0, videos } });
  } catch (e: any) {
    console.error("apivideo.analytics error:", e);
    res.status(500).json({ success: false, message: "Erro interno do servidor", error: e?.message || String(e) });
  }
};
