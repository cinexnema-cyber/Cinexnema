import type { Request, Response } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

function parseAmountFromPlan(plan?: string): number {
  if (!plan) return 0;
  const p = String(plan).toLowerCase();
  if (p.includes("year")) return 199.9;
  if (p.includes("lifetime")) return 499.9;
  return 19.9; // monthly default
}

function monthsSince(dateIso?: string | null): number {
  if (!dateIso) return 0;
  const start = new Date(dateIso);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

function computeCommission(amount: number, creatorSince?: string | null): number {
  if (amount <= 0) return 0;
  const m = monthsSince(creatorSince);
  // Grace period: first 3 months full (100%), afterwards 70% to creator
  return m <= 3 ? amount : amount * 0.7;
}

export const trackView = async (req: Request, res: Response) => {
  try {
    const { ref, videoId } = req.query as any;
    if (!ref) return res.json({ success: true, message: "No ref provided" });

    const sb = getSupabaseAdmin();
    // Try common table names for flexibility
    const payload = {
      creator_id: String(ref),
      video_id: videoId ? String(videoId) : null,
      user_id: null,
      type: "view",
      amount: null,
      currency: "BRL",
      created_at: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null,
      ua: req.headers["user-agent"] || null,
    } as any;

    const tables = ["referrals", "affiliate_events", "creator_referrals"];
    let ok = false;
    for (const t of tables) {
      const { error } = await sb.from(t).insert([payload]);
      if (!error) { ok = true; break; }
    }

    return res.json({ success: true, stored: ok });
  } catch (e: any) {
    console.warn("trackView error:", e?.message);
    return res.json({ success: true, stored: false });
  }
};

export const trackSubscription = async (req: Request, res: Response) => {
  try {
    const { ref, videoId, userId, plan, amount } = req.body || {};
    if (!ref || !userId) return res.status(400).json({ success: false, message: "ref e userId são obrigatórios" });

    const sb = getSupabaseAdmin();

    // Fetch creator to get start date (best-effort)
    let creatorSince: string | null = null;
    try {
      const { data: creator } = await sb.from("users").select("created_at").eq("id", String(ref)).maybeSingle();
      creatorSince = creator?.created_at || null;
    } catch {}

    const planAmount = amount ? Number(amount) : parseAmountFromPlan(plan);
    const commission = computeCommission(planAmount, creatorSince);

    const basePayload = {
      creator_id: String(ref),
      video_id: videoId ? String(videoId) : null,
      user_id: String(userId),
      type: "subscription",
      amount: commission,
      currency: "BRL",
      created_at: new Date().toISOString(),
      plan: plan || null,
    } as any;

    const tables = ["referrals", "affiliate_events", "creator_referrals"];
    let stored = false;
    for (const t of tables) {
      const { error } = await sb.from(t).insert([basePayload]);
      if (!error) { stored = true; break; }
    }

    // Optional: accumulate on creator row if column exists
    try {
      await sb.rpc("increment_creator_earnings", { p_creator_id: String(ref), p_amount: commission });
    } catch {}
    try {
      await sb.from("users").update({ affiliate_earnings: (commission as any) }).eq("id", String(ref));
    } catch {}

    return res.json({ success: true, stored, commission });
  } catch (e: any) {
    console.error("trackSubscription error:", e?.message);
    return res.status(500).json({ success: false, message: "Erro ao registrar assinatura" });
  }
};

export const getCreatorReferralSummary = async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params as any;
    if (!creatorId) return res.status(400).json({ success: false, message: "creatorId é obrigatório" });

    const sb = getSupabaseAdmin();
    const tables = ["referrals", "affiliate_events", "creator_referrals"];
    let rows: any[] = [];
    for (const t of tables) {
      const { data, error } = await sb.from(t).select("type, amount").eq("creator_id", String(creatorId));
      if (!error && data) { rows = data; break; }
    }

    const totalViews = rows.filter(r => r.type === "view").length;
    const totalSignups = rows.filter(r => r.type === "subscription").length;
    const totalEarnings = rows.filter(r => r.type === "subscription").reduce((s, r) => s + Number(r.amount || 0), 0);

    return res.json({ success: true, summary: { totalViews, totalSignups, totalEarnings } });
  } catch (e: any) {
    console.error("getCreatorReferralSummary error:", e?.message);
    return res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};
