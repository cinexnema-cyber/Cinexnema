import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";
import crypto from "crypto";

// Validation schemas
const generateLinkSchema = Joi.object({
  creatorId: Joi.string().required(),
});

const processReferralSchema = Joi.object({
  referralCode: Joi.string().required(),
  newUserId: Joi.string().required(),
  planType: Joi.string().valid("basic", "premium", "vip").required(),
});

/**
 * Generate unique affiliate link for creator
 * POST /api/affiliate/generate-link
 */
export const generateAffiliateLink = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = generateLinkSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    const { creatorId } = value;

    // Verify creator exists and is approved
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Criador não encontrado" });
    }

    if (creator.tipo !== "criador") {
      return res.status(403).json({ message: "Usuário não é um criador" });
    }

    if (creator.creatorProfile?.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Criador ainda não foi aprovado" });
    }

    // Generate unique referral code if doesn't exist
    let referralCode = creator.referralCode;
    if (!referralCode) {
      // Generate unique code based on creator ID and timestamp
      const timestamp = Date.now().toString(36);
      const hash = crypto
        .createHash("md5")
        .update(creatorId + timestamp)
        .digest("hex")
        .slice(0, 8);
      referralCode =
        `${creator.nome.toLowerCase().replace(/\s+/g, "")}_${hash}`.slice(
          0,
          20,
        );

      // Ensure uniqueness
      let isUnique = false;
      let attempt = 0;
      while (!isUnique && attempt < 5) {
        const existing = await User.findOne({ referralCode });
        if (!existing) {
          isUnique = true;
        } else {
          referralCode = `${referralCode}_${attempt}`;
          attempt++;
        }
      }

      // Update creator with referral code
      creator.referralCode = referralCode;

      // Generate affiliate link
      const baseUrl = process.env.FRONTEND_URL || "https://xnema.com";
      const affiliateLink = `${baseUrl}/register?ref=${referralCode}`;

      // Update creator profile
      if (creator.creatorProfile) {
        creator.creatorProfile.affiliateCode = referralCode;
        creator.creatorProfile.affiliateLink = affiliateLink;
      }

      await creator.save();
    }

    const baseUrl = process.env.FRONTEND_URL || "https://xnema.com";
    const affiliateLink = `${baseUrl}/register?ref=${referralCode}`;

    res.json({
      success: true,
      referralCode,
      affiliateLink,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(affiliateLink)}`,
    });
  } catch (error) {
    console.error("Erro ao gerar link de afiliação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Get affiliate statistics for creator
 * GET /api/affiliate/stats/:creatorId
 */
export const getAffiliateStats = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;

    // Verify access permissions
    if (req.userId !== creatorId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Criador não encontrado" });
    }

    // Get users referred by this creator
    const referredUsers = await User.find({
      referredBy: creatorId,
      subscriptionStatus: "ativo",
    });

    // Calculate statistics
    const totalSignups = referredUsers.length;
    const totalClicks = Math.floor(totalSignups * (Math.random() * 5 + 1)); // Simulate click tracking
    const conversionRate =
      totalClicks > 0 ? (totalSignups / totalClicks) * 100 : 0;

    // Calculate earnings (15% commission)
    let totalEarnings = 0;
    const recentReferrals = referredUsers.slice(-5).map((user) => {
      const planPrices = { basic: 19.9, premium: 59.9, vip: 199.0 };
      const planPrice =
        planPrices[user.subscriptionPlan as keyof typeof planPrices] || 59.9;
      const commission = planPrice * 0.15; // 15% commission
      totalEarnings += commission;

      return {
        id: user.id,
        userName: user.nome,
        signupDate: user.subscriptionStart || user.data_criacao,
        planType: user.subscriptionPlan || "premium",
        commission,
        status: Math.random() > 0.3 ? "paid" : "pending", // Simulate payment status
      };
    });

    // Update creator profile with latest stats
    if (creator.creatorProfile) {
      creator.creatorProfile.referralCount = totalSignups;
      creator.creatorProfile.affiliateEarnings = totalEarnings;
      await creator.save();
    }

    const stats = {
      totalClicks,
      totalSignups,
      totalEarnings,
      conversionRate,
      recentReferrals,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de afiliação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Process new user registration via referral
 * POST /api/affiliate/process-referral
 */
export const processReferral = async (req: Request, res: Response) => {
  try {
    const { error, value } = processReferralSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    const { referralCode, newUserId, planType } = value;

    // Find creator by referral code
    const creator = await User.findOne({ referralCode });
    if (!creator) {
      return res.status(404).json({ message: "Código de referência inválido" });
    }

    // Get new user
    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Prevent self-referral
    if (creator.id === newUserId) {
      return res
        .status(400)
        .json({ message: "Não é possível se auto-referenciar" });
    }

    // Check if user wasn't already referred
    if (newUser.referredBy) {
      return res
        .status(400)
        .json({ message: "Usuário já foi referenciado por outro criador" });
    }

    // Update new user with referral information
    newUser.referredBy = creator.id;
    newUser.freeMonthsRemaining = 1; // 1 mês grátis para referidos
    await newUser.save();

    // Update creator statistics
    if (creator.creatorProfile) {
      creator.creatorProfile.referralCount =
        (creator.creatorProfile.referralCount || 0) + 1;

      // Calculate commission (15% of monthly plan price)
      const planPrices = { basic: 19.9, premium: 59.9, vip: 199.0 };
      const commission =
        (planPrices[planType as keyof typeof planPrices] || 59.9) * 0.15;
      creator.creatorProfile.affiliateEarnings =
        (creator.creatorProfile.affiliateEarnings || 0) + commission;

      await creator.save();
    }

    res.json({
      success: true,
      message: "Referência processada com sucesso",
      commission: creator.creatorProfile?.affiliateEarnings || 0,
    });
  } catch (error) {
    console.error("Erro ao processar referência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Validate referral code during registration
 * GET /api/affiliate/validate/:referralCode
 */
export const validateReferralCode = async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;

    if (!referralCode) {
      return res
        .status(400)
        .json({ message: "Código de referência obrigatório" });
    }

    // Find creator by referral code
    const creator = await User.findOne({
      referralCode,
      tipo: "criador",
      "creatorProfile.status": "approved",
    });

    if (!creator) {
      return res.status(404).json({
        valid: false,
        message: "Código de referência inválido ou criador não aprovado",
      });
    }

    res.json({
      valid: true,
      creatorInfo: {
        id: creator.id,
        nome: creator.nome,
        avatar: creator.avatar,
        verificado: creator.verificado,
      },
      benefits: {
        freeMonths: 1,
        description: "1 mês grátis cortesia do criador " + creator.nome,
      },
    });
  } catch (error) {
    console.error("Erro ao validar código de referência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Get top performing affiliates (Admin only)
 * GET /api/admin/affiliate/top-performers
 */
export const getTopAffiliates = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Verify admin access
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // Get creators with affiliate data
    const topCreators = await User.find({
      tipo: "criador",
      "creatorProfile.status": "approved",
      "creatorProfile.referralCount": { $gt: 0 },
    })
      .sort({ "creatorProfile.referralCount": -1 })
      .limit(10)
      .select(
        "nome avatar creatorProfile.referralCount creatorProfile.affiliateEarnings referralCode",
      );

    const topPerformers = topCreators.map((creator) => ({
      id: creator.id,
      nome: creator.nome,
      avatar: creator.avatar,
      referralCode: creator.referralCode,
      totalReferrals: creator.creatorProfile?.referralCount || 0,
      totalEarnings: creator.creatorProfile?.affiliateEarnings || 0,
      estimatedClicks: Math.floor(
        (creator.creatorProfile?.referralCount || 0) * (Math.random() * 5 + 1),
      ),
    }));

    res.json({
      success: true,
      topPerformers,
      totalStats: {
        totalCreators: topCreators.length,
        totalReferrals: topCreators.reduce(
          (sum, c) => sum + (c.creatorProfile?.referralCount || 0),
          0,
        ),
        totalCommissions: topCreators.reduce(
          (sum, c) => sum + (c.creatorProfile?.affiliateEarnings || 0),
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar top afiliados:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};
