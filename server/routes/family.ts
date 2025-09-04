import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

export const saveFamilyMembers: RequestHandler = async (req, res) => {
  try {
    const { owner_user_id, emails } = req.body as { owner_user_id?: string; emails?: string[] };
    if (!owner_user_id || !Array.isArray(emails)) {
      return res.status(400).json({ success: false, message: "owner_user_id e emails são obrigatórios" });
    }

    const supabase = getSupabaseAdmin();
    const sanitized = emails
      .map((e) => String(e || "").trim().toLowerCase())
      .filter((e) => !!e)
      .slice(0, 5);

    // Upsert rows into family_members
    const rows = sanitized.map((email) => ({ owner_user_id, email, password: "acessocinexnemafamila" }));

    // Remove existing and insert new for simplicity
    const { error: delErr } = await supabase.from("family_members").delete().eq("owner_user_id", owner_user_id);
    if (delErr && delErr.code !== "PGRST116") {
      return res.status(500).json({ success: false, message: delErr.message });
    }

    if (rows.length) {
      const { error: insErr } = await supabase.from("family_members").insert(rows);
      if (insErr) return res.status(500).json({ success: false, message: insErr.message });
    }

    res.json({ success: true, total: rows.length, password: "acessocinexnemafamila" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Erro interno" });
  }
};

export const getFamilyMembers: RequestHandler = async (req, res) => {
  try {
    const owner_user_id = String(req.query.owner_user_id || "");
    if (!owner_user_id) return res.status(400).json({ success: false, message: "owner_user_id é obrigatório" });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("family_members").select("email, created_at").eq("owner_user_id", owner_user_id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, members: data || [], password: "acessocinexnemafamila" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Erro interno" });
  }
};
