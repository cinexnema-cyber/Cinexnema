import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../utils/supabaseClient";
import { generateToken } from "../middleware/auth";

export const loginBasic = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const sb = getSupabaseAdmin();
    const { data: user, error } = await sb
      .from("users")
      .select("id, name, email, password_hash, role")
      .ilike("email", email.trim())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: "Usuário sem senha definida" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = generateToken(String(user.id), user.email, user.role || "user");
    return res.json({ token, role: user.role || "user", name: user.name || user.email.split("@")[0] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};
