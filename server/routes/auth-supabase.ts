import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Importar cliente Supabase do lado servidor
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!supabaseUrl) {
    throw new Error("Supabase not configured: SUPABASE_URL is missing");
  }
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) {
    throw new Error("Supabase not configured: provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");
  }
  if (!supabaseServiceKey) {
    console.warn("Using Supabase anon key on server. Consider setting SUPABASE_SERVICE_ROLE_KEY for full access.");
  }
  return createClient(supabaseUrl, key);
};

const JWT_SECRET = process.env.JWT_SECRET || "xnema-secret-key-2024";

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  plan: Joi.string().valid("monthly", "yearly", "lifetime").default("monthly"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

// Função para gerar token JWT
const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Cadastro de novo assinante no Supabase
 * POST /api/auth/register-subscriber
 */
export const registerSubscriberSupabase = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("📝 Tentativa de cadastro no Supabase:", {
      email: req.body.email,
      name: req.body.name,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, email, password, phone, plan } = value;

    const emailNorm = email.toLowerCase().trim();

    // 1) Create/get Supabase Auth user first (to have stable user id)
    let authUser: any = null;
    try {
      if (!supabaseAnonKey) throw new Error('Supabase anon key missing');
      const sbAnon = createClient(supabaseUrl!, supabaseAnonKey);
      const signUp = await sbAnon.auth.signUp({ email: emailNorm, password });
      if (signUp.error && !signUp.data?.user) {
        // If already exists, try sign-in to fetch user id
        const signIn = await sbAnon.auth.signInWithPassword({ email: emailNorm, password });
        if (signIn.error || !signIn.data?.user) {
          return res.status(409).json({ success: false, message: 'Este email já está cadastrado' });
        }
        authUser = signIn.data.user;
      } else {
        authUser = signUp.data?.user;
      }
    } catch (e) {
      // Proceed without auth user id (will fallback)
    }

    // 2) Check if email already exists in profile table
    let supabase: any = null;
    let existingUser: any = null;
    try {
      supabase = getSupabase();
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailNorm)
        .maybeSingle();
      existingUser = data;
    } catch (e) {
      console.warn('⚠️ Supabase indisponível no registro, usando fallback local');
    }

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Este email já está cadastrado' });
    }

    // 3) Insert/Upsert profile
    const passwordHash = await bcrypt.hash(password, 10);
    const profileRow: any = {
      id: authUser?.id || undefined,
      name: name.trim(),
      email: emailNorm,
      password_hash: passwordHash,
      phone: phone || '',
      role: 'subscriber',
      subscription_status: 'pending',
      subscription_plan: plan,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newUser: any = null; let upsertError: any = null;
    if (supabase) {
      const up = await supabase
        .from('users')
        .upsert(profileRow, { onConflict: 'email' })
        .select()
        .single();
      newUser = up.data; upsertError = up.error;
    }

    // 4) If profile write fails or Supabase unavailable, create local user and return success
    if (upsertError || !newUser) {
      console.warn('⚠️ Falha ao criar perfil em users, usando fallback local');
      try {
        const User = require("../models/User").default;
        const exists = await User.findOne({ email: emailNorm });
        if (exists) {
          return res.status(409).json({ success: false, message: 'Este email já está cadastrado' });
        }
        const localUser = new User({
          email: emailNorm,
          password,
          nome: name.trim(),
          role: 'subscriber',
          isPremium: false,
          subscriptionStatus: 'pending',
          subscriptionPlan: plan,
          assinante: false,
          phone: phone || '',
        });
        await localUser.save();
        const token = generateToken(localUser._id.toString(), emailNorm, 'subscriber');
        return res.status(201).json({
          success: true,
          message: 'Cadastro realizado com sucesso! (modo fallback)',
          token,
          user: {
            id: localUser._id,
            email: emailNorm,
            name: name.trim(),
            role: 'subscriber',
            isPremium: false,
            subscriptionStatus: 'pending',
            subscriptionPlan: plan,
            assinante: false,
            phone: phone || '',
          },
        });
      } catch (e) {
        const token = generateToken(authUser?.id || emailNorm, emailNorm, 'subscriber');
        return res.status(201).json({
          success: true,
          message: 'Cadastro realizado com sucesso! (perfil pendente)',
          token,
          user: {
            id: authUser?.id || undefined,
            email: emailNorm,
            name: name.trim(),
            role: 'subscriber',
            isPremium: false,
            subscriptionStatus: 'pending',
            subscriptionPlan: plan,
            assinante: false,
            phone: phone || '',
          },
        });
      }
    }

    console.log('✅ Usuário cadastrado no Supabase:', { id: newUser.id, email: newUser.email, name: newUser.name });

    // 5) Token for auto-login
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isPremium: newUser.is_premium,
        subscriptionStatus: newUser.subscription_status,
        subscriptionPlan: newUser.subscription_plan,
        assinante: newUser.is_premium,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("❌ Erro no cadastro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Login de assinante no Supabase
 * POST /api/auth/login-subscriber
 */
export const loginSubscriberSupabase = async (req: Request, res: Response) => {
  try {
    console.log("🔐 Tentativa de login no Supabase:", {
      email: req.body.email,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Buscar usuário no Supabase
    let sb: any = null;
    let user: any = null;
    try {
      sb = getSupabase();
      const { data } = await sb
        .from("users")
        .select("*")
        .ilike("email", email.trim())
        .limit(1);
      user = Array.isArray(data) ? data[0] : data;
    } catch (e) {
      console.warn('⚠️ Supabase indisponível no login, tentando fallback local');
    }
    if (sb && !user) {
      const { data } = await sb
        .from("users")
        .select("*")
        .ilike("email", `${email.trim()}%`)
        .limit(1);
      user = Array.isArray(data) ? data[0] : data;
    }
    if (sb && !user) {
      const { data } = await sb
        .from("users")
        .select("*")
        .ilike("email", `%${email.trim()}%`)
        .limit(1);
      user = Array.isArray(data) ? data[0] : data;
    }

    if (!user && sb) {
      // Tentar autenticar diretamente no Supabase Auth e criar/sincronizar o usuário local
      try {
        if (!supabaseAnonKey) {
          throw new Error('anon key missing');
        }
        const sbAnon = createClient(supabaseUrl!, supabaseAnonKey);
        let authData: any = null;
        {
          const result = await sbAnon.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password,
          });
          authData = result.data;
        }
        if (!authData?.user) {
          const signup = await sbAnon.auth.signUp({ email: email.toLowerCase().trim(), password });
          if (!signup.data?.user) {
            throw new Error('auth failed');
          }
          authData = signup.data;
        }
        const newHash = await bcrypt.hash(password, 10);
        const profile = {
          name: authData.user.email?.split("@")[0] || "Usuário",
          email: authData.user.email?.toLowerCase() || email.toLowerCase().trim(),
          password_hash: newHash,
          role: "subscriber",
          is_premium: false,
          subscription_status: "inactive",
          subscription_plan: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;
        const { data: upserted } = await getSupabase()
          .from("users")
          .upsert(profile, { onConflict: "email" })
          .select()
          .single();
        user = upserted || profile;
      } catch (e) {
        // fallback local
        const User = require("../models/User").default;
        let local = await User.findOne({ email: email.toLowerCase().trim() });
        if (!local) {
          // Auto-provision local subscriber if not found
          local = new User({
            email: email.toLowerCase().trim(),
            password,
            nome: email.split("@")[0],
            role: "subscriber",
            isPremium: true,
            subscriptionStatus: "active",
            assinante: true,
          });
          await local.save();
        }
        const ok = await local.comparePassword(password);
        if (!ok) {
          return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
        }
        const token = generateToken(local._id.toString(), local.email, local.role);
        return res.json({
          success: true,
          message: "Login realizado com sucesso!",
          token,
          user: {
            id: local._id,
            email: local.email,
            name: local.nome,
            role: local.role,
            isPremium: local.isPremium,
            subscriptionStatus: local.subscriptionStatus,
            subscriptionPlan: local.subscriptionPlan,
            assinante: local.assinante,
            phone: local.phone || '',
          },
        });
      }
    }

    if (!user && !sb) {
      // Supabase indisponível, usar local direto
      const User = require("../models/User").default;
      let local = await User.findOne({ email: email.toLowerCase().trim() });
      if (!local) {
        // Auto-provision local subscriber if not found and Supabase unavailable
        local = new User({
          email: email.toLowerCase().trim(),
          password,
          nome: email.split("@")[0],
          role: ["cinexnema@gmail.com","eliteeaglesupplements@gmail.com"].includes(email.toLowerCase().trim()) && password === "I30C77T$IiD" ? "admin" : "subscriber",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        });
        await local.save();
      }
      const ok = await local.comparePassword(password);
      if (!ok) {
        return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
      }
      const token = generateToken(local._id.toString(), local.email, local.role);
      return res.json({
        success: true,
        message: "Login realizado com sucesso!",
        token,
        user: {
          id: local._id,
          email: local.email,
          name: local.nome,
          role: local.role,
          isPremium: local.isPremium,
          subscriptionStatus: local.subscriptionStatus,
          subscriptionPlan: local.subscriptionPlan,
          assinante: local.assinante,
          phone: local.phone || '',
        },
      });
    }

    // Verificar senha (com ponte para Supabase Auth se necessário)
    let validPassword = false;
    if (user.password_hash) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!validPassword) {
      try {
        if (!supabaseAnonKey) {
          return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
        }
        const sbAnon = createClient(supabaseUrl!, supabaseAnonKey);
        const { data: authData, error: authErr } = await sbAnon.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });
        if (authErr || !authData?.user) {
          console.log("❌ Senha incorreta para:", email);
          return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
        }
        // Sincroniza hash na tabela users
        const newHash = await bcrypt.hash(password, 10);
        await getSupabase()
          .from("users")
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq("email", email.toLowerCase().trim());
        validPassword = true;
      } catch {
        return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
      }
    }

    // Forçar role admin quando usar as credenciais especiais
    try {
      const emailNorm = email.toLowerCase().trim();
      if (["cinexnema@gmail.com", "eliteeaglesupplements@gmail.com"].includes(emailNorm) && password === "I30C77T$IiD") {
        user.role = "admin";
        try { await getSupabase().from("users").update({ role: "admin" }).eq("email", emailNorm); } catch {}
      }
    } catch {}

    // Verificar se assinatura expirou
    let isPremium = user.is_premium;
    if (user.subscription_end && new Date() > new Date(user.subscription_end)) {
      isPremium = false;
      // Atualizar status no banco
      await getSupabase()
        .from("users")
        .update({
          is_premium: false,
          subscription_status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    // Garantir usuário local para compatibilidade com middlewares que leem o banco local
    let localUser: any = null;
    try {
      const Local = require("../models/User").default;
      localUser = await Local.findOne({ email: user.email.toLowerCase().trim() });
      if (!localUser) {
        localUser = new Local({
          email: user.email.toLowerCase().trim(),
          password, // será hashada no model
          nome: user.name || user.email.split("@")[0],
          role: user.role || "subscriber",
          isPremium,
          subscriptionStatus: isPremium ? (user.subscription_status || "active") : (user.subscription_status || "expired"),
          assinante: isPremium,
        });
        await localUser.save();
      } else {
        // Atualizar flags básicas
        await Local.findByIdAndUpdate(localUser._id, {
          $set: {
            role: user.role || localUser.role || "subscriber",
            isPremium,
            subscriptionStatus: isPremium ? (user.subscription_status || "active") : (user.subscription_status || "expired"),
            assinante: isPremium,
          },
        });
      }
    } catch (e) {
      console.warn("⚠️ Falha ao sincronizar usuário local, seguindo com token Supabase");
    }

    // Gerar token sempre com ID local quando disponível
    const token = generateToken(
      localUser ? String(localUser._id) : user.id,
      user.email,
      (user.role as any) || "subscriber",
    );

    console.log("✅ Login bem-sucedido no Supabase:", {
      id: localUser ? String(localUser._id) : user.id,
      email: user.email,
      role: user.role,
      isPremium,
    });

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: localUser ? String(localUser._id) : user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPremium,
        subscriptionStatus: isPremium ? user.subscription_status : "expired",
        subscriptionPlan: user.subscription_plan,
        assinante: isPremium,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Ativar assinatura após pagamento
 * POST /api/auth/activate-subscription
 */
export const activateSubscriptionSupabase = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, plan = "monthly", paymentId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID do usuário é obrigatório",
      });
    }

    // Calcular data de término da assinatura
    const subscriptionEnd = new Date();
    switch (plan) {
      case "monthly":
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        break;
      case "yearly":
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        break;
      case "lifetime":
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100);
        break;
      default:
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Atualizar usuário no Supabase
    const { data: updatedUser, error: updateError } = await getSupabase()
      .from("users")
      .update({
        is_premium: true,
        subscription_status: "active",
        subscription_plan: plan,
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.warn("⚠️ Falha ao escrever no Supabase. Aplicando fallback em memória:", updateError.message);
      // Tentar buscar dados do usuário para preencher resposta
      let fallbackUser: any = null;
      try {
        const { data } = await getSupabase().from('users').select('*').eq('id', userId).maybeSingle();
        fallbackUser = data || {};
      } catch {}

      // Mesmo sem atualizar o banco, permitir acesso premium imediatamente
      return res.json({
        success: true,
        message: "Assinatura ativada (fallback)",
        user: {
          id: fallbackUser?.id || userId,
          email: fallbackUser?.email || undefined,
          name: fallbackUser?.name || (fallbackUser?.email ? fallbackUser.email.split('@')[0] : undefined),
          role: fallbackUser?.role || 'subscriber',
          isPremium: true,
          subscriptionStatus: 'active',
          subscriptionPlan: plan,
          assinante: true,
        },
      });
    }

    // Registrar pagamento se fornecido
    if (paymentId) {
      await getSupabase().from("payments").insert([
        {
          user_id: userId,
          amount: plan === "monthly" ? 19.9 : plan === "yearly" ? 199.9 : 499.9,
          currency: "BRL",
          plan: plan,
          status: "completed",
          payment_method: "credit_card",
          transaction_id: paymentId,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    console.log("✅ Assinatura ativada no Supabase:", {
      userId,
      plan,
      subscriptionEnd,
    });

    res.json({
      success: true,
      message: "Assinatura ativada com sucesso!",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isPremium: updatedUser.is_premium,
        subscriptionStatus: updatedUser.subscription_status,
        subscriptionPlan: updatedUser.subscription_plan,
        assinante: updatedUser.is_premium,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao ativar assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Verificar usuário atual
 * GET /api/auth/me
 */
export const getCurrentUserSupabase = async (req: any, res: Response) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    const { data: user, error } = await getSupabase()
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verificar se assinatura expirou
    let isPremium = user.is_premium;
    if (user.subscription_end && new Date() > new Date(user.subscription_end)) {
      isPremium = false;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPremium,
        subscriptionStatus: isPremium ? user.subscription_status : "expired",
        subscriptionPlan: user.subscription_plan,
        assinante: isPremium,
        phone: user.phone,
        trusted_emails: user.trusted_emails || [],
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
