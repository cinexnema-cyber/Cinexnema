import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import { generateToken } from "../middleware/auth";
import bcrypt from "bcryptjs";

// Validation schemas for separate login routes
const subscriberLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const creatorLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/**
 * Login de assinante
 * POST /api/auth/login-subscriber
 */
export const loginSubscriber = async (req: Request, res: Response) => {
  try {
    console.log("👤 Tentativa de login de assinante:", {
      email: req.body.email,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = subscriberLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user by email and role subscriber/premium
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: { $in: ["subscriber", "premium"] },
    });

    if (!user) {
      console.log("❌ Assinante não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Usuário assinante não encontrado",
      });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta para assinante:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    // Log user status for debugging
    console.log("📊 Status do assinante:", {
      role: user.role,
      isPremium: user.isPremium,
      subscriptionStatus: user.subscriptionStatus,
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login de assinante bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        assinante: user.assinante, // Backward compatibility
      },
    });
  } catch (error) {
    console.error("❌ Erro no login de assinante:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Login de criador
 * POST /api/auth/login-creator
 */
export const loginCreator = async (req: Request, res: Response) => {
  try {
    console.log("🎨 Tentativa de login de criador:", {
      email: req.body.email,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = creatorLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user by email and role creator
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "creator",
    });

    if (!user) {
      console.log("❌ Criador não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Criador não encontrado",
      });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta para criador:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    // Check creator approval status
    const creatorStatus = user.creatorProfile?.status || "pending";
    console.log("🎨 Status do criador:", {
      email,
      status: creatorStatus,
      creatorProfile: !!user.creatorProfile,
    });

    if (creatorStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message:
          "Sua conta de criador foi rejeitada. Entre em contato conosco.",
      });
    }

    // Allow login but restrict access to certain features if pending
    if (creatorStatus === "pending") {
      console.log("⏳ Criador com status pendente fazendo login:", email);
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login de criador bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      creatorStatus,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        creatorProfile: {
          status: creatorStatus,
          bio: user.creatorProfile?.bio,
          portfolio: user.creatorProfile?.portfolio,
          totalVideos: user.creatorProfile?.totalVideos || 0,
          totalViews: user.creatorProfile?.totalViews || 0,
          monthlyEarnings: user.creatorProfile?.monthlyEarnings || 0,
          affiliateEarnings: user.creatorProfile?.affiliateEarnings || 0,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro no login de criador:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Admin login (mantém separado)
 * POST /api/auth/login-admin
 */
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    console.log("👑 Tentativa de login de admin:", {
      email: req.body.email,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = subscriberLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user by email and role admin
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "admin",
    });

    if (!user) {
      console.log("❌ Admin não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Administrador não encontrado",
      });
    }

    // Special check for admin login - only allow specific email
    if (email !== "cinexnema@gmail.com") {
      console.log("❌ Tentativa de login admin não autorizada:", email);
      return res.status(403).json({
        success: false,
        message: "Acesso de administrador não autorizado",
      });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta para admin:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login de admin bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Erro no login de admin:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
