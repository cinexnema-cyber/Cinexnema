import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../utils/supabaseClient";
import { AuthenticatedRequest } from "../middleware/auth";

const signChildToken = (payload: any) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "xnema_dev_secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

const verifyChildToken = (authHeader?: string | null) => {
  if (!authHeader) throw new Error("Token ausente");
  const token = (authHeader || "").replace(/^Bearer\s+/i, "");
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "xnema_dev_secret";
  return jwt.verify(token, secret) as any;
};

export const createChildAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parentId = String(req.userId || "");
    if (!parentId) return res.status(401).json({ error: "Login necessário" });
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: "Email obrigatório" });

    const sb = getSupabaseAdmin();
    const existing = await sb.from("child_accounts").select("*").eq("email", email).maybeSingle();
    if (existing.data) return res.status(400).json({ error: "Email já registrado" });

    const { data, error } = await sb
      .from("child_accounts")
      .insert([{ parent_id: parentId, email, status: "active", created_at: new Date().toISOString() }])
      .select();
    if (error) return res.status(500).json({ error: error.message });

    // Append to parent's trusted_emails list
    try {
      const { data: u } = await sb.from("users").select("trusted_emails").eq("id", parentId).maybeSingle();
      const current: string[] = Array.isArray(u?.trusted_emails) ? u!.trusted_emails : [];
      const updated = Array.from(new Set([...(current || []), email]));
      await sb.from("users").upsert({ id: parentId, trusted_emails: updated }, { onConflict: "id" });
    } catch {}

    // Log also in trusted_emails table
    try { await sb.from("trusted_emails").insert([{ parent_id: parentId, email, created_at: new Date().toISOString() }]); } catch {}

    return res.json({ success: true, child: Array.isArray(data) ? data[0] : data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};

// Public check endpoint to detect if an email is a child account
export const checkChildEmail = async (req: Request, res: Response) => {
  try {
    const email = String((req.query.email as string) || "").trim();
    if (!email) return res.status(400).json({ error: "Email obrigatório" });
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("child_accounts")
      .select("id, parent_id, email, status")
      .eq("email", email)
      .maybeSingle();
    if (error && (error as any).code !== "PGRST116") return res.status(500).json({ error: error.message });
    if (!data) return res.json({ is_child: false });
    return res.json({ is_child: true, child: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};

export const childLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "Credenciais obrigatórias" });
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("child_accounts").select("*").eq("email", email).single();
    if (error && (error as any).code !== "PGRST116") return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Conta não encontrada" });

    if (data.status === "emancipated") {
      return res.status(403).json({ error: "Conta emancipada, faça login na conta principal" });
    }

    let ok = false;
    if (data.password_hash) ok = await bcrypt.compare(password, data.password_hash);
    else ok = true; // primeira definição de senha permitida

    if (!ok) return res.status(401).json({ error: "Senha incorreta" });

    // Se não possuía hash, salvar agora
    if (!data.password_hash) {
      const hash = await bcrypt.hash(password, 10);
      await sb.from("child_accounts").update({ password_hash: hash }).eq("id", data.id);
    }

    const token = signChildToken({ id: data.id, parentId: data.parent_id, type: "child" });
    return res.json({ token, allowed_videos: data.allowed_videos || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};

export const getChildVideos = async (req: Request, res: Response) => {
  try {
    const payload = verifyChildToken(req.headers.authorization as string);
    const childId = String(payload.id);
    const sb = getSupabaseAdmin();
    const { data: child, error: cErr } = await sb.from("child_accounts").select("allowed_videos").eq("id", childId).single();
    if (cErr) return res.status(500).json({ error: cErr.message });
    const allowed: any[] = Array.isArray(child?.allowed_videos) ? child!.allowed_videos : [];
    if (!allowed.length) return res.json([]);
    const { data: content } = await sb
      .from("content")
      .select("id, title, poster_url, duration_minutes")
      .in("id", allowed);
    return res.json(content || []);
  } catch (e: any) {
    return res.status(401).json({ error: e?.message || "Token inválido" });
  }
};

export const emancipateChild = async (req: Request, res: Response) => {
  try {
    const payload = verifyChildToken(req.headers.authorization as string);
    const childId = String(payload.id);
    const sb = getSupabaseAdmin();

    // Fetch child row
    const { data: child, error: cErr } = await sb.from("child_accounts").select("*").eq("id", childId).single();
    if (cErr) return res.status(500).json({ error: cErr.message });

    // Update status
    await sb.from("child_accounts").update({ status: "emancipated" }).eq("id", childId);

    // Ensure destination user exists, reuse child password if defined
    let newUserId: any = null;
    try {
      const { data: existing } = await sb.from("users").select("id").eq("email", child.email).maybeSingle();
      if (existing) newUserId = existing.id;
    } catch {}
    if (!newUserId) {
      const insertPayload: any = { email: child.email, created_at: new Date().toISOString() };
      if (child.password_hash) insertPayload.password_hash = child.password_hash;
      const { data: newUserRows, error: uErr } = await sb
        .from("users")
        .insert([insertPayload])
        .select();
      if (uErr) return res.status(500).json({ error: uErr.message });
      const newUser = Array.isArray(newUserRows) ? newUserRows[0] : newUserRows;
      newUserId = newUser.id;
    }

    // Copy watch history (best-effort) from user_watch_history using childId as user_id
    try {
      const { data: hist } = await sb.from("user_watch_history").select("content_id, position, progress, watched_at").eq("user_id", childId);
      if (Array.isArray(hist) && hist.length) {
        const rows = hist.map((h) => ({ user_id: newUserId, content_id: h.content_id, position: h.position, progress: h.progress, watched_at: h.watched_at || new Date().toISOString() }));
        // Insert in chunks
        while (rows.length) {
          const chunk = rows.splice(0, 500);
          await sb.from("user_watch_history").insert(chunk as any);
        }
      }
    } catch {}

    return res.json({ message: "Conta emancipada com sucesso", newUserId });
  } catch (e: any) {
    return res.status(401).json({ error: e?.message || "Token inválido" });
  }
};

// List child accounts for the authenticated parent
export const getMyChildAccounts = async (req: any, res: Response) => {
  try {
    const parentId = String(req.userId || "");
    if (!parentId) return res.status(401).json({ error: "Login necessário" });
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("child_accounts")
      .select("id, email, status, created_at")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ children: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};

// Emancipate a child account by id (parent or admin)
export const emancipateChildById = async (req: any, res: Response) => {
  try {
    const parentId = String(req.userId || "");
    const childId = String(req.params.id || "");
    if (!parentId || !childId) return res.status(400).json({ error: "Parâmetros inválidos" });
    const sb = getSupabaseAdmin();

    // Fetch child row and ensure ownership
    const { data: child, error: cErr } = await sb
      .from("child_accounts")
      .select("*")
      .eq("id", childId)
      .maybeSingle();
    if (cErr) return res.status(500).json({ error: cErr.message });
    if (!child) return res.status(404).json({ error: "Conta filho não encontrada" });
    if (String(child.parent_id) !== parentId) return res.status(403).json({ error: "Sem permissão" });

    // Update status
    await sb.from("child_accounts").update({ status: "emancipated" }).eq("id", childId);

    // Ensure destination user exists, reuse child password if defined
    let newUserId: any = null;
    try {
      const { data: existing } = await sb.from("users").select("id").eq("email", child.email).maybeSingle();
      if (existing) newUserId = existing.id;
    } catch {}
    if (!newUserId) {
      const insertPayload: any = { email: child.email, created_at: new Date().toISOString() };
      if (child.password_hash) insertPayload.password_hash = child.password_hash;
      const { data: newUserRows, error: uErr } = await sb
        .from("users")
        .insert([insertPayload])
        .select();
      if (uErr) return res.status(500).json({ error: uErr.message });
      const newUser = Array.isArray(newUserRows) ? newUserRows[0] : newUserRows;
      newUserId = newUser.id;
    }

    // Copy watch history
    try {
      const { data: hist } = await sb.from("user_watch_history").select("content_id, position, progress, watched_at").eq("user_id", childId);
      if (Array.isArray(hist) && hist.length) {
        const rows = hist.map((h) => ({ user_id: newUserId, content_id: h.content_id, position: h.position, progress: h.progress, watched_at: h.watched_at || new Date().toISOString() }));
        while (rows.length) {
          const chunk = rows.splice(0, 500);
          await sb.from("user_watch_history").insert(chunk as any);
        }
      }
    } catch {}

    return res.json({ success: true, newUserId });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};

// Emancipate a child by email (based on parent's trusted_emails association)
export const emancipateChildByEmail = async (req: any, res: Response) => {
  try {
    const parentId = String(req.userId || "");
    const { email } = req.body as { email?: string };
    if (!parentId || !email) return res.status(400).json({ error: "Parâmetros inválidos" });
    const sb = getSupabaseAdmin();

    // If exists in child_accounts for this parent, mark emancipated
    try {
      await sb.from("child_accounts").update({ status: "emancipated" }).eq("parent_id", parentId).eq("email", email);
    } catch {}

    // Remove from parent's users.trusted_emails
    try {
      const { data: userRow } = await sb.from("users").select("trusted_emails").eq("id", parentId).maybeSingle();
      const list: string[] = Array.isArray(userRow?.trusted_emails) ? userRow!.trusted_emails : [];
      const updated = list.filter((e) => (e || "").toLowerCase() !== email.toLowerCase());
      await sb.from("users").upsert({ id: parentId, trusted_emails: updated }, { onConflict: "id" });
    } catch {}

    // Remove from trusted_emails table
    try { await sb.from("trusted_emails").delete().eq("parent_id", parentId).eq("email", email); } catch {}

    // Ensure standalone user exists
    let newUserId: any = null;
    try {
      const { data: existing } = await sb.from("users").select("id").eq("email", email).maybeSingle();
      if (existing) newUserId = existing.id;
    } catch {}
    if (!newUserId) {
      const { data: rows } = await sb.from("users").insert([{ email, created_at: new Date().toISOString() }]).select();
      const newUser = Array.isArray(rows) ? rows[0] : rows;
      newUserId = newUser?.id;
    }

    return res.json({ success: true, newUserId });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
};
