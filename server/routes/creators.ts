import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import User from "../models/User";

const getBaseUrl = (req: Request) => {
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    (req.headers?.origin as string) ||
    `https://${req.headers.host}` ||
    "https://cinexnema.com"
  ).replace(/\/$/, "");
};

export const getCreatorVideosSupabase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data, error } = await sb.from("videos").select("*").eq("creator_id", id);
      if (error) throw error;
      return res.json({ videos: data || [] });
    } catch (e: any) {
      console.warn("Supabase indisponível ou sem dados (videos)", e?.message || e);
      return res.json({ videos: [] });
    }
  } catch (err: any) {
    console.error("❌ getCreatorVideosSupabase error:", err?.message || err);
    return res.json({ videos: [] });
  }
};

export const updateCreatorInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, bio, profile_image, payment_info } = req.body || {};
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data, error } = await sb
        .from("creators")
        .update({ name, bio, profile_image, payment_info })
        .eq("id", id)
        .select();
      if (error) throw error;
      return res.json({ creator: Array.isArray(data) ? data[0] : data });
    } catch (e: any) {
      console.warn("Supabase indisponível (update creator)", e?.message || e);
      return res.json({ creator: { id, name, bio, profile_image, payment_info } });
    }
  } catch (err: any) {
    console.error("❌ updateCreatorInfo error:", err?.message || err);
    return res.json({ creator: null });
  }
};

export const getCreatorReferral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const base = getBaseUrl(req);
    const referralLink = `${base}/inscrever?ref=${encodeURIComponent(id)}`;
    return res.json({ referral_link: referralLink });
  } catch (err: any) {
    console.error("❌ getCreatorReferral error:", err?.message || err);
    return res.json({ referral_link: getBaseUrl(req) + "/inscrever" });
  }
};

export const getCreatorMetrics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data: viewsData } = await sb
        .from("video_views")
        .select("id, video_id")
        .eq("creator_id", id);
      const { data: subsData } = await sb
        .from("subscriptions")
        .select("id")
        .eq("ref_creator", id);
      const views = Array.isArray(viewsData) ? viewsData.length : 0;
      const subscriptions = Array.isArray(subsData) ? subsData.length : 0;
      return res.json({ views, subscriptions });
    } catch (e: any) {
      console.warn("Supabase indisponível (metrics)", e?.message || e);
      return res.json({ views: 0, subscriptions: 0 });
    }
  } catch (err: any) {
    console.error("❌ getCreatorMetrics error:", err?.message || err);
    return res.json({ views: 0, subscriptions: 0 });
  }
};

export const getCreatorPublic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data: creator, error: err1 } = await sb
        .from("creators")
        .select("id, name, bio, profile_image")
        .eq("id", id)
        .single();

      const { data: videos, error: err2 } = await sb
        .from("videos")
        .select("*")
        .eq("creator_id", id)
        .eq("status", "approved");

      if (err1 || err2) throw (err1 || err2);

      return res.json({ creator, videos: videos || [] });
    } catch (e: any) {
      console.warn("Supabase indisponível (public)", e?.message || e);
      return res.json({ creator: null, videos: [] });
    }
  } catch (err: any) {
    console.error("❌ getCreatorPublic error:", err?.message || err);
    return res.json({ creator: null, videos: [] });
  }
};

export const acceptCreatorPolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data } = await sb
        .from("creators")
        .update({ accepted_policy: true })
        .eq("id", id)
        .select();
      return res.json({ success: true, creator: Array.isArray(data) ? data[0] : data });
    } catch (e: any) {
      console.warn("Supabase indisponível (accept policy)", e?.message || e);
      return res.json({ success: true, creator: { id, accepted_policy: true } });
    }
  } catch (err: any) {
    console.error("❌ acceptCreatorPolicy error:", err?.message || err);
    return res.json({ success: false });
  }
};

// Helper to compute months left
const monthsLeft = (end?: Date | string | null) => {
  if (!end) return 0;
  const endDate = new Date(end);
  const now = new Date();
  if (isNaN(endDate.getTime()) || endDate <= now) return 0;
  const diffMs = endDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (30 * 24 * 60 * 60 * 1000)));
};

// Current user analytics alias expected by frontend: /api/creators/analytics
export const getMyCreatorAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = String(req.userId || "");

    // Try Supabase metrics for this creator id
    let metrics = { views: 0, subscriptions: 0 } as { views: number; subscriptions: number };
    try {
      const { getSupabaseAdmin } = require("../utils/supabaseClient");
      const sb = getSupabaseAdmin();
      const { data: viewsData } = await sb.from("video_views").select("id, video_id").eq("creator_id", userId);
      const { data: subsData } = await sb.from("subscriptions").select("id").eq("ref_creator", userId);
      metrics.views = Array.isArray(viewsData) ? viewsData.length : 0;
      metrics.subscriptions = Array.isArray(subsData) ? subsData.length : 0;
    } catch (e: any) {
      console.warn("Supabase indisponível (my analytics)", e?.message || e);
    }

    // Read grace period from User model
    let overview: any = { graceStartDate: null, graceEndDate: null, graceMonthsLeft: 0 };
    try {
      const user = await User.findById(userId);
      const cp: any = (user && user.creatorProfile) || {};
      overview.graceStartDate = cp.graceStartDate || null;
      overview.graceEndDate = cp.graceEndDate || null;
      overview.graceMonthsLeft = monthsLeft(cp.graceEndDate || null);
    } catch {}

    return res.json({ success: true, data: { overview, metrics } });
  } catch (err: any) {
    console.error("❌ getMyCreatorAnalytics error:", err?.message || err);
    return res.json({ success: true, data: { overview: { graceMonthsLeft: 0 }, metrics: { views: 0, subscriptions: 0 } } });
  }
};
