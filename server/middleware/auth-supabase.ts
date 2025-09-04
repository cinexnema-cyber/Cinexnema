import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = process.env.JWT_SECRET || "xnema-secret-key-2024";
const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string | undefined;

const getSupabase = () => {
  if (!supabaseUrl) throw new Error("Supabase not configured: SUPABASE_URL is missing");
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) throw new Error("Supabase not configured: provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");
  return createClient(supabaseUrl, key);
};

export const authenticateTokenSupabase = async (
  req: Request & { user?: any; userId?: string; userRole?: string },
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token de acesso requerido" });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded?.userId;
    const email = decoded?.email;

    // Buscar usuário no Supabase por id ou email
    const sb = getSupabase();
    let user: any = null;

    if (userId) {
      const { data } = await sb.from("users").select("*").eq("id", userId).maybeSingle();
      user = data;
    }

    if (!user && email) {
      const { data } = await sb.from("users").select("*").ilike("email", email.trim()).maybeSingle();
      user = data;
    }

    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    // If token carries a higher-privilege role (creator/admin), honor it for this request
    if (decoded?.role && typeof decoded.role === "string") {
      const tokenRole = String(decoded.role).toLowerCase();
      if ((tokenRole === "creator" || tokenRole === "admin") && tokenRole !== String(user.role || "").toLowerCase()) {
        user.role = tokenRole;
      }
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
};
