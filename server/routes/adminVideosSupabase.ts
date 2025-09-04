import { Request, Response } from "express";

export const getPendingVideosSupabase = async (_req: Request, res: Response) => {
  try {
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data, error } = await sb.from("videos").select("*").eq("status", "pending");
      if (error) throw error;
      return res.json({ videos: data || [] });
    } catch (e: any) {
      console.warn("Supabase indisponível (pending videos)", e?.message || e);
      return res.json({ videos: [] });
    }
  } catch (err: any) {
    console.error("❌ getPendingVideosSupabase error:", err?.message || err);
    return res.json({ videos: [] });
  }
};

export const approveVideoSupabase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data, error } = await sb
        .from("videos")
        .update({ status: "approved" })
        .eq("id", id)
        .select();
      if (error) throw error;
      return res.json({ video: Array.isArray(data) ? data[0] : data });
    } catch (e: any) {
      console.warn("Supabase indisponível (approve)", e?.message || e);
      return res.json({ video: null });
    }
  } catch (err: any) {
    console.error("❌ approveVideoSupabase error:", err?.message || err);
    return res.json({ video: null });
  }
};

export const rejectVideoSupabase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data, error } = await sb
        .from("videos")
        .update({ status: "rejected" })
        .eq("id", id)
        .select();
      if (error) throw error;
      return res.json({ video: Array.isArray(data) ? data[0] : data });
    } catch (e: any) {
      console.warn("Supabase indisponível (reject)", e?.message || e);
      return res.json({ video: null });
    }
  } catch (err: any) {
    console.error("❌ rejectVideoSupabase error:", err?.message || err);
    return res.json({ video: null });
  }
};
