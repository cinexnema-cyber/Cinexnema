import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!supabaseUrl) throw new Error("Supabase not configured: SUPABASE_URL is missing");
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) throw new Error("Supabase not configured: provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");
  return createClient(supabaseUrl, key);
};

export const saveVideoProgress = async (req: Request, res: Response) => {
  try {
    const { user_id, video_id, last_time } = req.body || {};

    if (!user_id || !video_id || typeof last_time !== "number") {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const payload = {
      user_id,
      video_id,
      last_time,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await getSupabase()
      .from("video_progress")
      .upsert(payload)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  } catch (e: any) {
    console.error("/api/video-progress POST error:", e);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getVideoProgress = async (req: Request, res: Response) => {
  try {
    const user_id = (req.query.user_id as string) || "";
    const video_id = (req.query.video_id as string) || "";

    if (!user_id || !video_id) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const { data, error } = await getSupabase()
      .from("video_progress")
      .select("last_time")
      .eq("user_id", user_id)
      .eq("video_id", video_id)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ last_time: data?.last_time ?? 0 });
  } catch (e: any) {
    console.error("/api/video-progress GET error:", e);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
