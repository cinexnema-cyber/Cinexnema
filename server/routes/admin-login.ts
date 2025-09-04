import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../middleware/auth";
import { getSupabaseAdmin } from "../utils/supabaseClient";

const ALLOWED_ADMINS = [
  { email: "cinexnema@gmail.com", password: "I30C77T$IiD", name: "CineXnema Admin" },
  { email: "eliteeaglesupplements@gmail.com", password: "I30C77T$IiD", name: "Elite Eagle Admin" },
];

async function ensureSupabaseAdmin(email: string, password: string, name: string) {
  try {
    const sb = getSupabaseAdmin();
    try {
      await sb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "admin", name },
      });
    } catch {}
    await sb
      .from("users")
      .upsert(
        {
          email: email.toLowerCase(),
          name,
          role: "admin",
          is_premium: true,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
  } catch (e) {
    console.warn("Supabase admin sync skipped:", (e as any)?.message);
  }
}

/**
 * Login de admin restrito às duas contas fornecidas
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const b = (req.body || {}) as { email?: string; password?: string };
    const q = (req.query || {}) as { email?: string; password?: string };
    const email = (b.email || q.email || "").toLowerCase().trim();
    const password = (b.password || q.password || "").toString();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email e senha são obrigatórios" });
    }

    const target = ALLOWED_ADMINS.find(
      (a) => a.email.toLowerCase() === email,
    );

    if (!target) {
      return res.status(403).json({ success: false, message: "Acesso negado" });
    }

    if (password !== target.password) {
      return res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }

    let adminUser = await User.findOne({ email: target.email.toLowerCase() });
    if (!adminUser) {
      adminUser = new User({
        email: target.email.toLowerCase(),
        password: target.password,
        nome: target.name,
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await adminUser.save();
    } else if (adminUser.role !== "admin") {
      await User.updateOne({ _id: adminUser._id }, { $set: { role: "admin" } });
    }

    await ensureSupabaseAdmin(target.email, target.password, target.name);

    const token = generateToken(adminUser._id.toString(), adminUser.email, "admin");

    res.json({
      success: true,
      message: "Login admin realizado com sucesso",
      token,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.nome,
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
      },
    });
  } catch (error) {
    console.error("❌ Erro no login admin:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: (error as any).message,
    });
  }
};

/**
 * Provisionar as duas contas de admin no Supabase e local
 */
export const createAdminUsers = async (req: Request, res: Response) => {
  try {
    const created: any[] = [];
    for (const a of ALLOWED_ADMINS) {
      let u = await User.findOne({ email: a.email.toLowerCase() });
      if (!u) {
        u = new User({
          email: a.email.toLowerCase(),
          password: a.password,
          nome: a.name,
          role: "admin",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        });
        await u.save();
        created.push({ email: a.email, name: a.name });
      } else if (u.role !== "admin") {
        await User.updateOne({ _id: u._id }, { $set: { role: "admin" } });
      }
      await ensureSupabaseAdmin(a.email, a.password, a.name);
    }

    res.json({ success: true, totalAdmins: ALLOWED_ADMINS.length, created });
  } catch (error) {
    console.error("❌ Erro ao criar admins:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: (error as any).message,
    });
  }
};

/**
 * Verificar status dos usuários admin
 */
export const checkAdminStatus = async (req: Request, res: Response) => {
  try {
    const admins = await User.find(
      { role: "admin" },
      "email nome role isPremium subscriptionStatus",
    );

    res.json({
      success: true,
      totalAdmins: admins.length,
      admins: admins.map((admin) => ({
        email: admin.email,
        name: admin.nome,
        role: admin.role,
        isPremium: admin.isPremium,
        subscriptionStatus: admin.subscriptionStatus,
      })),
    });
  } catch (error) {
    console.error("��� Erro ao verificar admins:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: (error as any).message,
    });
  }
};
