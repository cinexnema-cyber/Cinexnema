import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { getSupabaseAdmin } from "../utils/supabaseClient";

export const listDevices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("devices")
      .select("id, user_id, device_id, email, ip, user_agent, created_at")
      .eq("user_id", req.userId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, devices: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "Erro interno" });
  }
};

export const deleteDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("devices").delete().eq("id", id).eq("user_id", req.userId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "Erro interno" });
  }
};

export const addTrustedEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ success: false, error: "Email obrigatório" });
    const supabase = getSupabaseAdmin();
    // Fetch current trusted emails
    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id, trusted_emails")
      .eq("id", req.userId)
      .single();
    if (userErr && userErr.code !== "PGRST116") {
      return res.status(500).json({ success: false, error: userErr.message });
    }
    const current = Array.isArray(userRow?.trusted_emails) ? userRow?.trusted_emails : [];
    const updated = Array.from(new Set([...(current as any[]), email]));
    const { error: updErr } = await supabase
      .from("users")
      .upsert({ id: req.userId, trusted_emails: updated }, { onConflict: "id" });
    if (updErr) return res.status(500).json({ success: false, error: updErr.message });

    // Also log in trusted_emails table for admin listing
    try {
      await supabase.from("trusted_emails").insert([{ parent_id: req.userId, email, created_at: new Date().toISOString() }]);
    } catch {}

    // Create or ensure child_accounts row exists for this email/parent
    try {
      const { data: exists } = await supabase
        .from("child_accounts")
        .select("id")
        .eq("parent_id", req.userId)
        .eq("email", email)
        .maybeSingle();
      if (!exists) {
        await supabase
          .from("child_accounts")
          .insert([{ parent_id: req.userId, email, status: "active", created_at: new Date().toISOString() }]);
      }
    } catch {}

    return res.json({ success: true, trusted_emails: updated });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "Erro interno" });
  }
};
