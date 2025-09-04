import { Request, Response } from "express";
import Joi from "joi";
import { generateToken } from "../middleware/auth";

// Validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

/**
 * Criar usuários de teste automaticamente se não existirem
 */
export const createTestUsersIfNeeded = async () => {
  try {
    const User = require("../models/User").default;
    const userCount = await User.countDocuments();
    console.log(`📊 Total de usuários no banco: ${userCount}`);

    // Se não há usuários, criar os básicos
    if (userCount === 0) {
      console.log("🔧 Criando usuários básicos...");

      const defaultUsers = [
        {
          email: "iarima@xnema.com",
          password: "iarima123",
          nome: "Iarima Temiski",
          role: "admin",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        },
        {
          email: "admin@xnema.com",
          password: "admin123",
          nome: "Administrador",
          role: "admin",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        },
        {
          email: "assinante@xnema.com",
          password: "123456",
          nome: "Assinante Premium",
          role: "subscriber",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        },
        {
          email: "criador@xnema.com",
          password: "123456",
          nome: "Criador de Conteúdo",
          role: "creator",
          isPremium: false,
          subscriptionStatus: "pending",
          assinante: false,
          creatorProfile: {
            bio: "Criador de conteúdo",
            status: "approved",
            totalVideos: 0,
            approvedVideos: 0,
            rejectedVideos: 0,
            totalViews: 0,
            monthlyEarnings: 0,
            affiliateEarnings: 0,
            referralCount: 0,
          },
        },
      ];

      for (const userData of defaultUsers) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Usuário criado: ${userData.email} (${userData.role})`);
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Erro ao criar usuários:", error);
    return false;
  }
};

/**
 * Login de assinante - aceita qualquer usuário mas trata como assinante
 */
export const subscriberLogin = async (req: Request, res: Response) => {
  try {
    console.log("👤 Tentativa de login de assinante:", {
      email: req.body.email,
      timestamp: new Date().toISOString(),
    });

    // Primeiro, garantir que temos usuários no sistema
    await createTestUsersIfNeeded();

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Buscar usuário por email (qualquer role)
    const User = require("../models/User").default;
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      console.log("❌ Usuário não encontrado:", email);

      // Tentar criar usuário automaticamente para emails específicos
      if (email === "iarima@xnema.com" && password === "iarima123") {
        console.log("🔧 Criando usuário Iarima automaticamente...");
        const User = require("../models/User").default;
        const newUser = new User({
          email: "iarima@xnema.com",
          password: "iarima123",
          nome: "Iarima Temiski",
          role: "admin",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        });
        await newUser.save();
        console.log("✅ Usuário Iarima criado automaticamente");

        // Continuar com o login
        const token = generateToken(
          newUser._id.toString(),
          newUser.email,
          newUser.role,
        );
        return res.json({
          success: true,
          token,
          user: {
            id: newUser._id,
            email: newUser.email,
            name: newUser.nome,
            role: newUser.role,
            isPremium: newUser.isPremium,
            subscriptionStatus: newUser.subscriptionStatus,
            assinante: newUser.assinante,
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado. Verifique o email.",
      });
    }

    // Verificar senha
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta para:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
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

    // Resposta de sucesso - trata qualquer usuário como "assinante" nesta rota
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role, // Mantém role original
        isPremium: user.isPremium || user.assinante || user.role === "admin",
        subscriptionStatus: user.subscriptionStatus || "active",
        assinante: user.assinante || user.isPremium || user.role === "admin",
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
 * Verificar status dos usuários assinantes
 */
export const checkSubscribers = async (req: Request, res: Response) => {
  try {
    const User = require("../models/User").default;
    const users = await User.find(
      {},
      "email nome role isPremium subscriptionStatus assinante",
    );

    res.json({
      success: true,
      totalUsers: users.length,
      users: users.map((user) => ({
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        assinante: user.assinante,
      })),
    });
  } catch (error) {
    console.error("❌ Erro ao verificar assinantes:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Criar usuário assinante específico
 */
export const createSubscriber = async (req: Request, res: Response) => {
  try {
    const {
      email = "test@assinante.com",
      password = "123456",
      name = "Assinante Teste",
    } = req.body;

    // Verificar se usuário já existe
    const User = require("../models/User").default;
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      return res.json({
        success: true,
        message: "Usuário já existe",
        user: {
          email: user.email,
          name: user.nome,
          role: user.role,
          created: false,
        },
      });
    }

    // Criar novo assinante
    user = new User({
      email: email.toLowerCase().trim(),
      password,
      nome: name,
      role: "subscriber",
      isPremium: true,
      subscriptionStatus: "active",
      assinante: true,
    });

    await user.save();

    console.log("✅ Assinante criado:", {
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Assinante criado com sucesso",
      user: {
        email: user.email,
        name: user.nome,
        role: user.role,
        created: true,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao criar assinante:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
