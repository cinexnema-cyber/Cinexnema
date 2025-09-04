import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

export const setUserApiVideoToken: RequestHandler = async (req, res) => {
  try {
    const requesterRole = (req as any).userRole as string | undefined;
    if (requesterRole !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado" });
    }
    const { userId } = req.params as any;
    const { token } = req.body as any;
    if (!userId || !token) {
      return res.status(400).json({ success: false, message: "userId e token são obrigatórios" });
    }
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("users").update({ apivideo_token: token }).eq("id", userId);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Erro interno" });
  }
};

export const setMyApiVideoToken: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    const { token } = req.body as any;
    if (!token) return res.status(400).json({ success: false, message: "token é obrigatório" });
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("users").update({ apivideo_token: token }).eq("id", userId);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Erro interno" });
  }
};
