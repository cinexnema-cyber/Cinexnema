import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!supabaseUrl) {
    throw new Error("Supabase not configured: SUPABASE_URL is missing");
  }
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) {
    throw new Error(
      "Supabase not configured: provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY",
    );
  }
  if (!supabaseServiceKey) {
    console.warn(
      "Using Supabase anon key on server. Consider setting SUPABASE_SERVICE_ROLE_KEY for full access.",
    );
  }
  return createClient(supabaseUrl, key);
};

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

export const registerGeneralSupabase = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = value;

    // Check for existing user
    const { data: existing, error: checkError } = await getSupabase()
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (checkError) {
      console.error("Supabase check error:", checkError);
    }

    if (existing) {
      return res.status(409).json({ error: "Email já está em uso" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await getSupabase()
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash,
          role: "subscriber",
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(200).json({ user: data });
  } catch (e: any) {
    console.error("/api/register error:", e);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const loginGeneralSupabase = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    const emailNorm = email.trim();
    const sb = getSupabase();

    // Try exact (case-insensitive) match first
    let userRow: any = null;
    {
      const { data: rows, error: e1 } = await sb
        .from("users")
        .select("*")
        .ilike("email", emailNorm)
        .order("created_at", { ascending: false })
        .limit(1);
      if (!e1) userRow = Array.isArray(rows) ? rows[0] : rows;
    }

    // Fallback: trim anomalies and prefix match
    if (!userRow) {
      const { data: rows2 } = await sb
        .from("users")
        .select("*")
        .ilike("email", `${emailNorm}%`)
        .order("created_at", { ascending: false })
        .limit(1);
      userRow = Array.isArray(rows2) ? rows2[0] : rows2;
    }

    // Fallback: contains match (last resort)
    if (!userRow) {
      const { data: rows3 } = await sb
        .from("users")
        .select("*")
        .ilike("email", `%${emailNorm}%`)
        .order("created_at", { ascending: false })
        .limit(1);
      userRow = Array.isArray(rows3) ? rows3[0] : rows3;
    }

    if (!userRow) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const data = userRow;

    let isValid = false;
    if (data.password_hash) {
      isValid = await bcrypt.compare(password, data.password_hash);
    }

    if (!isValid) {
      // Tentativa de ponte: valida via Supabase Auth e sincroniza a tabela users
      try {
        if (!supabaseAnonKey) {
          return res.status(401).json({ error: "Senha inválida" });
        }
        const sbAnon = createClient(supabaseUrl!, supabaseAnonKey);
        const { data: authData, error: authErr } = await sbAnon.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });
        if (authErr || !authData?.user) {
          return res.status(401).json({ error: "Senha inválida" });
        }

        // Auth OK: sincronizar/atualizar users
        const newHash = await bcrypt.hash(password, 10);
        const baseUser = {
          name: data?.name || (authData.user.email?.split("@")[0] || "Usuário"),
          email: authData.user.email?.toLowerCase() || email.toLowerCase().trim(),
          password_hash: newHash,
          role: data?.role || "user",
          is_premium: !!data?.is_premium,
          created_at: data?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: upserted, error: upErr } = await getSupabase()
          .from("users")
          .upsert(baseUser, { onConflict: "email" })
          .select()
          .single();
        if (upErr) {
          return res.status(200).json({ user: data }); // retorna user original para não travar
        }
        return res.status(200).json({ user: upserted });
      } catch {
        return res.status(401).json({ error: "Senha inválida" });
      }
    }

    return res.status(200).json({ user: data });
  } catch (e: any) {
    console.error("/api/login error:", e);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
