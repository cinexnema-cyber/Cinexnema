import { Request, Response } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

export const listTrustedEmails = async (_req: Request, res: Response) => {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("trusted_emails")
      .select("id, email, parent_id, created_at, parent:users(email, name)")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};

export const deleteTrustedEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("trusted_emails").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};
