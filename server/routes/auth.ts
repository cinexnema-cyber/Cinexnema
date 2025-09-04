import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import { generateToken } from "../middleware/auth";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@shared/auth";

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "subscriber", "creator").optional(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string()
    .valid("subscriber", "creator")
    .optional()
    .default("subscriber"), // Default to subscriber
  bio: Joi.string().optional(),
  portfolio: Joi.string().uri().optional(),
  paymentMethod: Joi.string().optional(),
});

export const login = async (req: Request, res: Response) => {
  try {
    console.log("🔐 Tentativa de login:", {
      email: req.body.email,
      role: req.body.role,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      console.log("❌ Erro de validação no login:", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as LoginResponse);
    }

    const { email, password, role } = value as LoginRequest;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      } as LoginResponse);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("❌ Senha incorreta para:", email);
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      } as LoginResponse);
    }

    // Check role if specified
    if (role && user.role !== role) {
      console.log("❌ Role mismatch:", {
        userRole: user.role,
        requestedRole: role,
        email,
      });
      return res.status(403).json({
        success: false,
        message: `Usuário não tem permissão para acessar como ${role}`,
      } as LoginResponse);
    }

    // Log user status for debugging
    console.log("📊 Status do usuário:", {
      role: user.role,
      isPremium: user.isPremium,
      subscriptionStatus: user.subscriptionStatus,
    });

    // Special check for admin login
    if (user.role === "admin") {
      if (email !== "cinexnema@gmail.com") {
        console.log("❌ Tentativa de login admin não autorizada:", email);
        return res.status(403).json({
          success: false,
          message: "Acesso de administrador não autorizado",
        } as LoginResponse);
      }
    }

    // Check creator approval status (allow login but restrict access to certain features)
    if (user.role === "creator") {
      const status = user.profile?.status || "pending";
      console.log("🎨 Login de criador:", { email, status });

      if (status === "rejected") {
        return res.status(403).json({
          success: false,
          message:
            "Sua conta de criador foi rejeitada. Entre em contato conosco.",
        } as LoginResponse);
      }
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    } as LoginResponse);
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    } as LoginResponse);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    console.log("📝 Tentativa de registro:", {
      email: req.body.email,
      role: req.body.role,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log("❌ Erro de validação:", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as RegisterResponse);
    }

    const { email, password, name, role, bio, portfolio, paymentMethod } =
      value as RegisterRequest;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email já existe:", email);
      return res.status(409).json({
        success: false,
        message: "Email já está em uso",
      } as RegisterResponse);
    }

    // SEGURANÇA: Todos novos usuários começam como subscriber com isPremium: false
    const userData: any = {
      email: email.toLowerCase().trim(),
      password,
      nome: name.trim(), // Using 'nome' to match schema
      role: role || "subscriber", // Default to subscriber if not specified
      isPremium: false, // CRÍTICO: Nunca premium na criação
      subscriptionStatus: "pending", // Pendente até pagamento
      assinante: false, // Backward compatibility
      freeMonthsRemaining: 1, // 1 mês grátis para novos usuários
    };

    if (role === "subscriber" || !role) {
      console.log("👤 Criando usuário assinante:", {
        email,
        name,
        role: "subscriber",
        isPremium: false,
      });
    } else if (role === "creator") {
      userData.role = "creator";
      userData.creatorProfile = {
        bio: bio || "",
        portfolio: portfolio || "",
        status: "pending",
        totalVideos: 0,
        approvedVideos: 0,
        rejectedVideos: 0,
        totalViews: 0,
        monthlyEarnings: 0,
        affiliateEarnings: 0,
        referralCount: 0,
      };

      console.log("🎨 Criando usuário criador:", {
        email,
        name,
        bio: userData.creatorProfile.bio,
      });
    }

    const user = new User(userData);
    const savedUser = await user.save();

    console.log("✅ Usuário salvo com sucesso:", {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      isPremium: savedUser.isPremium,
      subscriptionStatus: savedUser.subscriptionStatus,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message:
        role === "creator"
          ? "Conta de criador criada! Aguarde aprovação da administração."
          : "Conta criada com sucesso!",
      user: savedUser.toJSON(),
    } as RegisterResponse);
  } catch (error) {
    console.error("❌ Erro no registro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    } as RegisterResponse);
  }
};

export const validateToken = async (req: Request, res: Response) => {
  // This route is protected by authenticateToken middleware
  // If we reach here, token is valid
  res.json({
    success: true,
    user: req.user,
  });
};
