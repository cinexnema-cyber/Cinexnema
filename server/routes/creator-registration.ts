import { RequestHandler } from "express";
import User from "../models/User";
import { z } from "zod";

// Validation schema for creator registration
const creatorRegistrationSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos").optional(),
  portfolio: z.union([z.string().url("URL do portfólio inválida"), z.literal("")]).optional(),
  description: z.string().min(0).optional(),
  gracePeriod: z.enum(["1", "2", "3"]).default("2"),
});

// Register new creator (pending approval)
export const registerCreator: RequestHandler = async (req, res) => {
  try {
    const validatedData = creatorRegistrationSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({
      email: validatedData.email.toLowerCase()
    });

    if (existingUser) {
      // Upgrade existing user to include creator role, preserving other capabilities
      const currentRole = String(existingUser.role || "");
      const roles = currentRole.split(",").map((r: string) => r.trim()).filter(Boolean);
      if (!roles.includes("creator")) roles.push("creator");
      const newRole = roles.join(",");

      existingUser.role = newRole;
      existingUser.creatorProfile = {
        ...(existingUser.creatorProfile || {}),
        status: "pending",
        whatsapp: validatedData.whatsapp || existingUser.creatorProfile?.whatsapp || "",
        portfolio: validatedData.portfolio || existingUser.creatorProfile?.portfolio || "",
        description: validatedData.description || existingUser.creatorProfile?.description || "",
        gracePeriod: parseInt(validatedData.gracePeriod),
        appliedAt: new Date(),
        approvedAt: null,
        rejectedAt: null,
        approvedBy: null,
        rejectionReason: null,
      } as any;
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "Solicitação de criador registrada para usuário existente",
        data: { id: existingUser._id, email: existingUser.email, role: existingUser.role, status: existingUser.creatorProfile?.status },
      });
    }

    // Create creator with pending status
    const creatorData = {
      nome: validatedData.nome,
      email: validatedData.email.toLowerCase(),
      password: validatedData.password,
      role: "creator" as const,
      assinante: false,
      subscriptionStatus: "inativo" as const,

      // Creator-specific fields
      creatorProfile: {
        status: "pending",
        whatsapp: validatedData.whatsapp || "",
        portfolio: validatedData.portfolio || "",
        description: validatedData.description || "",
        gracePeriod: parseInt(validatedData.gracePeriod),
        appliedAt: new Date(),
        approvedAt: null,
        rejectedAt: null,
        approvedBy: null,
        rejectionReason: null,
      },
      
      // Initial creator settings
      comissaoPercentual: 70, // 70% for creator
      saldoDisponivel: 0,
      totalGanho: 0,
    };

    const creator = new User(creatorData);
    await creator.save();

    // Generate affiliate link immediately
    try {
      const code = `creator_${String(creator.id || creator._id || "").slice(-8)}`;
      const domain = "https://cinexnema.com";
      creator.creatorProfile = {
        ...(creator.creatorProfile || {}),
        affiliateCode: code,
        affiliateLink: `${domain}/ref/${code}`,
      } as any;
      await creator.save();
    } catch (e) {
      console.warn("Affiliate link generation skipped:", (e as any)?.message || e);
    }

    // Send notification to admins (in production, this would be email/SMS)
    console.log(`🔔 Nova solicitação de criador:
    Nome: ${validatedData.nome}
    Email: ${validatedData.email}
    WhatsApp: ${validatedData.whatsapp}
    Portfolio: ${validatedData.portfolio || 'Não informado'}
    Período de carência solicitado: ${validatedData.gracePeriod} meses
    `);

    return res.status(201).json({
      success: true,
      message: "Solicitação enviada com sucesso! Aguarde aprovação da equipe.",
      data: {
        id: creator.id,
        nome: creator.nome,
        email: creator.email,
        status: creator.creatorProfile?.status,
        gracePeriod: creator.creatorProfile?.gracePeriod,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error("❌ Erro no registro de criador:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Get pending creator applications (admin only)
export const getPendingCreators: RequestHandler = async (req, res) => {
  try {
    const pendingCreators = await User.find({
      role: "creator",
      "creatorProfile.status": "pending"
    }).select("-password").sort({ "creatorProfile.appliedAt": -1 });

    return res.json({
      success: true,
      data: pendingCreators,
      count: pendingCreators.length
    });

  } catch (error) {
    console.error("❌ Erro ao buscar criadores pendentes:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Approve creator application (admin only)
export const approveCreator: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { gracePeriodApproved } = req.body;

    const creator = await User.findById(creatorId);
    
    if (!creator || creator.role !== "creator") {
      return res.status(404).json({
        success: false,
        message: "Criador não encontrado",
      });
    }

    if (creator.creatorProfile?.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Esta solicitação já foi processada",
      });
    }

    // Update creator status
    creator.creatorProfile = {
      ...creator.creatorProfile,
      status: "approved",
      approvedAt: new Date(),
      approvedBy: req.userId, // From auth middleware
      gracePeriodApproved: gracePeriodApproved || creator.creatorProfile.gracePeriod,
      // Start grace period counting from approval
      graceStartDate: new Date(),
      graceEndDate: new Date(Date.now() + (gracePeriodApproved || creator.creatorProfile.gracePeriod) * 30 * 24 * 60 * 60 * 1000)
    };

    // Enable creator capabilities
    creator.assinante = true; // Give creator access to platform
    creator.subscriptionStatus = "ativo";

    await creator.save();

    console.log(`✅ Criador aprovado:
    Nome: ${creator.nome}
    Email: ${creator.email}
    Período de carência: ${gracePeriodApproved || creator.creatorProfile.gracePeriod} meses
    `);

    return res.json({
      success: true,
      message: "Criador aprovado com sucesso!",
      data: {
        id: creator.id,
        nome: creator.nome,
        email: creator.email,
        status: creator.creatorProfile.status,
        graceEndDate: creator.creatorProfile.graceEndDate
      }
    });

  } catch (error) {
    console.error("❌ Erro ao aprovar criador:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Reject creator application (admin only)
export const rejectCreator: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { reason } = req.body;

    const creator = await User.findById(creatorId);
    
    if (!creator || creator.role !== "creator") {
      return res.status(404).json({
        success: false,
        message: "Criador não encontrado",
      });
    }

    if (creator.creatorProfile?.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Esta solicitação já foi processada",
      });
    }

    // Update creator status
    creator.creatorProfile = {
      ...creator.creatorProfile,
      status: "rejected",
      rejectedAt: new Date(),
      rejectionReason: reason || "Não atende aos critérios da plataforma"
    };

    await creator.save();

    console.log(`❌ Criador rejeitado:
    Nome: ${creator.nome}
    Email: ${creator.email}
    Motivo: ${reason}
    `);

    return res.json({
      success: true,
      message: "Solicitação rejeitada",
      data: {
        id: creator.id,
        nome: creator.nome,
        email: creator.email,
        status: creator.creatorProfile.status,
        rejectionReason: creator.creatorProfile.rejectionReason
      }
    });

  } catch (error) {
    console.error("❌ Erro ao rejeitar criador:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Get creator analytics data
export const getCreatorAnalytics: RequestHandler = async (req, res) => {
  try {
    const creatorId = req.userId; // From auth middleware
    
    const creator = await User.findById(creatorId);
    
    if (!creator || creator.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado - apenas criadores podem acessar",
      });
    }

    // Mock analytics data - in production, this would come from real analytics
    const analyticsData = {
      overview: {
        totalViews: Math.floor(Math.random() * 50000) + 10000,
        totalRevenue: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
        totalSubscribers: Math.floor(Math.random() * 2000) + 500,
        totalVideos: Math.floor(Math.random() * 50) + 10,
        graceMonthsLeft: calculateGraceMonthsLeft(creator.creatorProfile?.graceEndDate as any),
        graceStartDate: creator.creatorProfile?.graceStartDate || null,
        graceEndDate: creator.creatorProfile?.graceEndDate || null,
        monthlyGrowth: parseFloat((Math.random() * 30 + 5).toFixed(1))
      },
      
      monthlyData: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
        views: Math.floor(Math.random() * 10000) + 5000,
        subscribers: Math.floor(Math.random() * 200) + 50
      })),
      
      categoryData: [
        { name: 'Ficção', views: Math.floor(Math.random() * 5000) + 2000, percentage: 35 },
        { name: 'Documentário', views: Math.floor(Math.random() * 3000) + 1500, percentage: 25 },
        { name: 'Drama', views: Math.floor(Math.random() * 2500) + 1200, percentage: 22 },
        { name: 'Comédia', views: Math.floor(Math.random() * 2000) + 1000, percentage: 18 }
      ],

      affiliateStats: {
        totalClicks: Math.floor(Math.random() * 100) + 20,
        newSubscribers: Math.floor(Math.random() * 20) + 5,
        affiliateRevenue: parseFloat((Math.random() * 300 + 50).toFixed(2))
      }
    };

    return res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error("❌ Erro ao buscar analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Generate unique affiliate link for creator
export const generateAffiliateLink: RequestHandler = async (req, res) => {
  try {
    const creatorId = req.userId;
    
    const creator = await User.findById(creatorId);
    
    if (!creator || creator.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado - apenas criadores podem acessar",
      });
    }

    // Generate unique affiliate code
    const affiliateCode = `creator_${creatorId.slice(-8)}_${Date.now().toString(36)}`;

    // Update creator with affiliate info
    creator.creatorProfile = {
      ...creator.creatorProfile,
      affiliateCode,
      affiliateLink: `https://cinexnema.com/ref/${affiliateCode}`
    };

    await creator.save();

    return res.json({
      success: true,
      data: {
        affiliateCode,
        affiliateLink: creator.creatorProfile.affiliateLink,
        commissionRate: 15 // 15% commission on new subscriptions
      }
    });

  } catch (error) {
    console.error("❌ Erro ao gerar link de afiliação:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Helper function to calculate grace months left
function calculateGraceMonthsLeft(graceEndDate?: Date): number {
  if (!graceEndDate) return 0;
  
  const now = new Date();
  const diffTime = graceEndDate.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return Math.max(0, diffMonths);
}
