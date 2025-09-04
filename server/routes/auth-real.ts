import { Request, Response } from "express";
import Joi from "joi";
import { generateToken } from "../middleware/auth";

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

/**
 * Cadastro de novo assinante
 * POST /api/auth/register-subscriber
 */
export const registerSubscriber = async (req: Request, res: Response) => {
  try {
    console.log("📝 Tentativa de cadastro de assinante:", {
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
    const User = require("../models/User").default;

    // Verificar se email já existe
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      console.log("❌ Email já existe:", email);
      return res.status(409).json({
        success: false,
        message: "Este email já está cadastrado",
      });
    }

    // Criar novo assinante
    const newUser = new User({
      email: email.toLowerCase().trim(),
      password: password, // Será hasheado automaticamente pelo modelo
      nome: name.trim(),
      role: "subscriber",
      isPremium: false, // Inicialmente false até confirmar pagamento
      subscriptionStatus: "pending",
      subscriptionPlan: plan,
      assinante: false, // Será true após pagamento
      phone: phone || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();

    console.log("✅ Assinante cadastrado:", {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.nome,
      role: savedUser.role,
    });

    // Gerar token para login automático
    const token = generateToken(
      savedUser._id.toString(),
      savedUser.email,
      savedUser.role,
    );

    res.status(201).json({
      success: true,
      message: "Cadastro realizado com sucesso!",
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        name: savedUser.nome,
        role: savedUser.role,
        isPremium: savedUser.isPremium,
        subscriptionStatus: savedUser.subscriptionStatus,
        subscriptionPlan: savedUser.subscriptionPlan,
        assinante: savedUser.assinante,
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
 * Login de assinante
 * POST /api/auth/login-subscriber
 */
export const loginSubscriber = async (req: Request, res: Response) => {
  try {
    console.log("🔐 Tentativa de login de assinante:", {
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
    const User = require("../models/User").default;

    // Buscar usuário por email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Verificar senha
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta para:", email);
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Gerar token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login de assinante bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        assinante: user.assinante,
        phone: user.phone || "",
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
 * Ativar assinatura (após pagamento)
 * POST /api/auth/activate-subscription
 */
export const activateSubscription = async (req: Request, res: Response) => {
  try {
    const { userId, plan = "monthly" } = req.body;
    const User = require("../models/User").default;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Ativar assinatura
    user.isPremium = true;
    user.assinante = true;
    user.subscriptionStatus = "active";
    user.subscriptionPlan = plan;
    user.subscriptionStart = new Date();

    // Calcular próxima cobrança
    const nextBilling = new Date();
    if (plan === "monthly") {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else if (plan === "yearly") {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    } else if (plan === "lifetime") {
      nextBilling.setFullYear(nextBilling.getFullYear() + 100); // Lifetime
    }

    user.subscriptionEnd = nextBilling;
    user.updatedAt = new Date();

    await user.save();

    console.log("✅ Assinatura ativada:", {
      userId: user._id,
      email: user.email,
      plan: plan,
    });

    res.json({
      success: true,
      message: "Assinatura ativada com sucesso!",
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        assinante: user.assinante,
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
 * Verificar status do usuário
 * GET /api/auth/me
 */
interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    const User = require("../models/User").default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        assinante: user.assinante,
        phone: user.phone || "",
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
