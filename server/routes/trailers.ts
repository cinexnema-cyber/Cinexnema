import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

export const getPublicTrailers: RequestHandler = async (_req, res) => {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("videos")
      .select("id, title, video_url, thumbnail_url, creator_id, status, is_trailer")
      .eq("is_trailer", true)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    const trailers = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      url: r.video_url || null,
      thumbnail: r.thumbnail_url || null,
      creatorId: r.creator_id || null,
    }));
    return res.json({ success: true, trailers });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || "Erro interno" });
  }
};

export const getSubscriberVideos: RequestHandler = async (_req, res) => {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("videos")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true, videos: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || "Erro interno" });
  }
};
