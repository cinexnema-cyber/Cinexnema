import { Request, Response } from "express";
import Joi from "joi";
import CreatorBlocks from "../models/CreatorBlocks";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

// Validation schemas
const calculateBlocksSchema = Joi.object({
  sizeGB: Joi.number().min(0.1).max(100).required(),
});

const purchaseBlocksSchema = Joi.object({
  blocks: Joi.number().min(1).max(50).required(),
});

const webhookSchema = Joi.object({
  action: Joi.string().required(),
  data: Joi.object({
    id: Joi.string().required(),
  }).required(),
  external_reference: Joi.string().optional(),
});

/**
 * Get creator blocks information
 * GET /api/creator-blocks/:creatorId
 */
export const getCreatorBlocks = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;

    // Verify access permissions
    if (req.userId !== creatorId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // Get or create creator blocks
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ message: "Criador não encontrado" });
    }

    const creatorBlocks = await CreatorBlocks.getOrCreateForCreator(
      creatorId,
      user.name,
    );

    res.json({
      success: true,
      creatorBlocks,
      summary: {
        blocks: creatorBlocks.blocksSummary,
        storage: creatorBlocks.storageSummary,
        stats: creatorBlocks.stats,
        canUpload: creatorBlocks.canUpload,
        restrictions: creatorBlocks.restrictions,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar blocos do criador:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Calculate blocks needed for a video
 * POST /api/creator-blocks/calculate
 */
export const calculateBlocks = async (req: Request, res: Response) => {
  try {
    const { error, value } = calculateBlocksSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    const { sizeGB } = value;

    // Calculate blocks needed
    const blocksNeeded = CreatorBlocks.calculateBlocksNeeded(sizeGB);
    const totalPrice = CreatorBlocks.calculatePrice(blocksNeeded);

    res.json({
      success: true,
      calculation: {
        sizeGB: Math.round(sizeGB * 100) / 100,
        blocksNeeded,
        pricePerBlock: 100000, // R$ 1000 in cents
        totalPrice, // in cents
        totalPriceFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalPrice / 100),
      },
    });
  } catch (error) {
    console.error("Erro ao calcular blocos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Check if creator can upload a video
 * POST /api/creator-blocks/:creatorId/check-upload
 */
export const checkUploadCapacity = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;
    const { error, value } = calculateBlocksSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    // Verify access permissions
    if (req.userId !== creatorId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const { sizeGB } = value;

    // Get creator blocks
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ message: "Criador não encontrado" });
    }

    const creatorBlocks = await CreatorBlocks.getOrCreateForCreator(
      creatorId,
      user.name,
    );
    const uploadCheck = creatorBlocks.canUploadVideo(sizeGB);

    res.json({
      success: true,
      canUpload: uploadCheck.canUpload,
      reason: uploadCheck.reason,
      blocksNeeded: uploadCheck.blocksNeeded,
      currentBlocks: {
        total: creatorBlocks.totalBlocks,
        used: creatorBlocks.usedBlocks,
        available: creatorBlocks.availableBlocks,
      },
      suggestedAction: uploadCheck.canUpload
        ? null
        : {
            type: "purchase",
            blocksNeeded: uploadCheck.blocksNeeded,
            minBlocksToPurchase: Math.max(
              1,
              (uploadCheck.blocksNeeded || 1) - creatorBlocks.availableBlocks,
            ),
          },
    });
  } catch (error) {
    console.error("Erro ao verificar capacidade de upload:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Purchase blocks
 * POST /api/creator-blocks/:creatorId/purchase
 */
export const purchaseBlocks = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;
    const { error, value } = purchaseBlocksSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    // Verify access permissions
    if (req.userId !== creatorId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const { blocks } = value;

    // Get creator
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ message: "Criador não encontrado" });
    }

    const creatorBlocks = await CreatorBlocks.getOrCreateForCreator(
      creatorId,
      user.name,
    );

    // Calculate price
    const totalPrice = CreatorBlocks.calculatePrice(blocks);
    const transactionId = `blocks_${creatorId}_${Date.now()}`;

    // Create purchase record
    await creatorBlocks.purchaseBlocks(blocks, transactionId, totalPrice);

    // Create Mercado Pago checkout URL (simplified - would use real API in production)
    const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?external_reference=${transactionId}&notification_url=${process.env.WEBHOOK_URL || "http://localhost:3001"}/api/creator-blocks/webhook&back_urls[success]=${process.env.FRONTEND_URL || "http://localhost:3000"}/video-upload?purchase=approved&back_urls[failure]=${process.env.FRONTEND_URL || "http://localhost:3000"}/creator-blocks/purchase-error&back_urls[pending]=${process.env.FRONTEND_URL || "http://localhost:3000"}/creator-blocks/purchase-pending`;

    res.json({
      success: true,
      message: "Compra iniciada com sucesso",
      purchase: {
        transactionId,
        blocks,
        totalPrice,
        totalPriceFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalPrice / 100),
        checkoutUrl,
      },
    });
  } catch (error) {
    console.error("Erro ao comprar blocos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Webhook for block purchase confirmation
 * POST /api/creator-blocks/webhook
 */
export const handleBlocksWebhook = async (req: Request, res: Response) => {
  try {
    console.log("Webhook de blocos recebido:", req.body);

    const { error, value } = webhookSchema.validate(req.body);
    if (error) {
      console.error("Webhook com dados inválidos:", error.details[0].message);
      return res.status(400).json({ message: "Dados do webhook inválidos" });
    }

    const { action, data } = value;
    const externalReference =
      req.body.external_reference || req.query.external_reference;

    // Process payment events
    if (action === "payment.created" || action === "payment.updated") {
      const paymentId = data.id;

      if (!externalReference) {
        console.error("External reference não encontrado no webhook de blocos");
        return res
          .status(400)
          .json({ message: "Referência externa não encontrada" });
      }

      // Find creator blocks by transaction ID
      const creatorBlocks =
        await CreatorBlocks.getByTransactionId(externalReference);

      if (!creatorBlocks) {
        console.error(
          "Compra de blocos não encontrada para transaction_id:",
          externalReference,
        );
        return res.status(404).json({ message: "Compra não encontrada" });
      }

      // Simulate payment verification (in production, would call Mercado Pago API)
      const paymentStatus = "approved"; // Would be obtained from API

      if (paymentStatus === "approved") {
        // Confirm purchase
        await creatorBlocks.confirmPurchase(externalReference, paymentId);

        console.log(
          `Compra de blocos aprovada para criador ${creatorBlocks.creatorName} - Transaction: ${externalReference}`,
        );
      } else if (paymentStatus === "rejected") {
        // Reject purchase
        await creatorBlocks.rejectPurchase(externalReference);

        console.log(
          `Compra de blocos rejeitada para transaction_id: ${externalReference}`,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Webhook processado com sucesso",
    });
  } catch (error) {
    console.error("Erro no webhook de blocos:", error);
    res.status(500).json({
      message: "Erro interno no webhook",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Get purchase history
 * GET /api/creator-blocks/:creatorId/purchases
 */
export const getPurchaseHistory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;

    // Verify access permissions
    if (req.userId !== creatorId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const creatorBlocks = await CreatorBlocks.findOne({ creatorId });

    if (!creatorBlocks) {
      return res.json({
        success: true,
        purchases: [],
        summary: {
          totalPurchases: 0,
          totalBlocks: 0,
          totalSpent: 0,
        },
      });
    }

    const purchases = creatorBlocks.purchases.map((purchase: any) => ({
      id: purchase._id,
      date: purchase.date,
      blocks: purchase.blocks,
      amountPaid: purchase.amountPaid,
      amountFormatted: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(purchase.amountPaid / 100),
      status: purchase.status,
      transactionId: purchase.transactionId,
      mercadoPagoId: purchase.mercadoPagoId,
    }));

    const summary = {
      totalPurchases: purchases.length,
      totalBlocks: creatorBlocks.totalBlocks,
      totalSpent: creatorBlocks.purchases
        .filter((p: any) => p.status === "approved")
        .reduce((sum: number, p: any) => sum + p.amountPaid, 0),
    };

    res.json({
      success: true,
      purchases: purchases.reverse(), // Most recent first
      summary: {
        ...summary,
        totalSpentFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(summary.totalSpent / 100),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de compras:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Add video to creator blocks (when video is uploaded)
 * POST /api/creator-blocks/:creatorId/add-video
 */
export const addVideoToBlocks = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;
    const { videoId, title, sizeGB } = req.body;

    // Verify access permissions (internal API - usually called by video upload)
    if (req.userId !== creatorId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ message: "Criador não encontrado" });
    }

    const creatorBlocks = await CreatorBlocks.getOrCreateForCreator(
      creatorId,
      user.name,
    );

    // Add video
    await creatorBlocks.addVideo(videoId, title, sizeGB);

    res.json({
      success: true,
      message: "Vídeo adicionado aos blocos do criador",
      updatedBlocks: {
        total: creatorBlocks.totalBlocks,
        used: creatorBlocks.usedBlocks,
        available: creatorBlocks.availableBlocks,
      },
    });
  } catch (error) {
    console.error("Erro ao adicionar vídeo aos blocos:", error);

    if (
      error instanceof Error &&
      error.message === "Blocos insuficientes para este vídeo"
    ) {
      return res.status(400).json({
        message: error.message,
        requiresPayment: true,
      });
    }

    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Remove video from creator blocks (when video is deleted)
 * POST /api/creator-blocks/:creatorId/remove-video
 */
export const removeVideoFromBlocks = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { creatorId } = req.params;
    const { videoId } = req.body;

    // Verify access permissions
    if (req.userId !== creatorId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const creatorBlocks = await CreatorBlocks.findOne({ creatorId });

    if (!creatorBlocks) {
      return res
        .status(404)
        .json({ message: "Blocos do criador não encontrados" });
    }

    // Remove video
    await creatorBlocks.removeVideo(videoId);

    res.json({
      success: true,
      message: "Vídeo removido dos blocos do criador",
      updatedBlocks: {
        total: creatorBlocks.totalBlocks,
        used: creatorBlocks.usedBlocks,
        available: creatorBlocks.availableBlocks,
      },
    });
  } catch (error) {
    console.error("Erro ao remover vídeo dos blocos:", error);

    if (error instanceof Error && error.message === "Video not found") {
      return res
        .status(404)
        .json({ message: "Vídeo não encontrado nos blocos" });
    }

    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Admin: Get all creators blocks summary
 * GET /api/admin/creator-blocks
 */
export const getAllCreatorsBlocks = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Verify admin access
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const creatorsBlocks = await CreatorBlocks.find({}).sort({ createdAt: -1 });

    const summary = creatorsBlocks.map((cb) => ({
      creatorId: cb.creatorId,
      creatorName: cb.creatorName,
      blocks: cb.blocksSummary,
      storage: cb.storageSummary,
      stats: cb.stats,
      canUpload: cb.canUpload,
      restrictions: cb.restrictions,
      lastActivity: cb.updatedAt,
    }));

    const totals = {
      totalCreators: creatorsBlocks.length,
      totalBlocks: creatorsBlocks.reduce((sum, cb) => sum + cb.totalBlocks, 0),
      totalRevenue: creatorsBlocks.reduce(
        (sum, cb) => sum + cb.stats.totalRevenue,
        0,
      ),
      totalVideos: creatorsBlocks.reduce(
        (sum, cb) => sum + cb.stats.totalVideoCount,
        0,
      ),
    };

    res.json({
      success: true,
      creatorsBlocks: summary,
      totals: {
        ...totals,
        totalRevenueFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totals.totalRevenue / 100),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar blocos de todos os criadores:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};
