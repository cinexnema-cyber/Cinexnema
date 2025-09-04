import { RequestHandler } from "express";
import CreatorLimit from "../models/CreatorLimit";
import Video from "../models/Video";

/**
 * Get creator limits by ID
 */
export const getCreatorLimits: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const requesterId = (req as any).user?.id;
    const requesterRole = (req as any).user?.role;

    // Check if user can access this creator's limits
    if (requesterId !== creatorId && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Você só pode ver seus próprios limites.",
      });
    }

    // Get or create creator limits
    const creatorLimit = await CreatorLimit.getOrCreateForCreator(
      creatorId,
      (req as any).user?.name || "Creator",
    );

    // Update grace period
    await creatorLimit.updateGracePeriod();

    res.json({
      success: true,
      limits: {
        storageUsedGB: creatorLimit.getStorageUsedGB(),
        storageLimitGB: creatorLimit.getStorageLimitGB(),
        storageUsedPercentage: creatorLimit.getStorageUsedPercentage(),
        videoCount: creatorLimit.videoCount,
        videoCountLimit: creatorLimit.videoCountLimit,
        graceMonthsLeft: creatorLimit.graceMonthsLeft,
        isGracePeriod: creatorLimit.isGracePeriod,
        totalRevenue: creatorLimit.totalRevenue,
        totalViews: creatorLimit.totalViews,
        currentCommissionRate: creatorLimit.currentCommissionRate,
        remainingStorageGB: creatorLimit.remainingStorageGB,
        restrictions: creatorLimit.restrictions,
      },
    });
  } catch (error) {
    console.error("Get creator limits error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar limites do criador",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update creator limits (admin only)
 */
export const updateCreatorLimits: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { storageLimit, videoCountLimit } = req.body;
    const requesterRole = (req as any).user?.role;

    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem alterar limites.",
      });
    }

    if (!storageLimit || !videoCountLimit) {
      return res.status(400).json({
        success: false,
        message: "Limite de armazenamento e limite de vídeos são obrigatórios",
      });
    }

    if (storageLimit < 0 || videoCountLimit < 0) {
      return res.status(400).json({
        success: false,
        message: "Limites devem ser valores positivos",
      });
    }

    const creatorLimit = await CreatorLimit.findOne({ creatorId });

    if (!creatorLimit) {
      return res.status(404).json({
        success: false,
        message: "Criador não encontrado",
      });
    }

    // Update limits
    creatorLimit.storageLimit = Number(storageLimit);
    creatorLimit.videoCountLimit = Number(videoCountLimit);

    await creatorLimit.save();

    res.json({
      success: true,
      limits: {
        storageUsedGB: creatorLimit.getStorageUsedGB(),
        storageLimitGB: creatorLimit.getStorageLimitGB(),
        storageUsedPercentage: creatorLimit.getStorageUsedPercentage(),
        videoCount: creatorLimit.videoCount,
        videoCountLimit: creatorLimit.videoCountLimit,
        graceMonthsLeft: creatorLimit.graceMonthsLeft,
        isGracePeriod: creatorLimit.isGracePeriod,
        totalRevenue: creatorLimit.totalRevenue,
        totalViews: creatorLimit.totalViews,
        currentCommissionRate: creatorLimit.currentCommissionRate,
        remainingStorageGB: creatorLimit.remainingStorageGB,
        restrictions: creatorLimit.restrictions,
      },
      message: "Limites atualizados com sucesso",
    });
  } catch (error) {
    console.error("Update creator limits error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar limites do criador",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Restrict creator uploads (admin only)
 */
export const restrictCreatorUpload: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { reason } = req.body;
    const requesterRole = (req as any).user?.role;

    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado. Apenas administradores podem restringir uploads.",
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Motivo da restrição é obrigatório",
      });
    }

    const creatorLimit = await CreatorLimit.findOne({ creatorId });

    if (!creatorLimit) {
      return res.status(404).json({
        success: false,
        message: "Criador não encontrado",
      });
    }

    await creatorLimit.restrictUpload(reason.trim());

    res.json({
      success: true,
      message: "Upload restringido com sucesso",
      restrictions: creatorLimit.restrictions,
    });
  } catch (error) {
    console.error("Restrict creator upload error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao restringir upload do criador",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Allow creator uploads (admin only)
 */
export const allowCreatorUpload: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const requesterRole = (req as any).user?.role;

    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem liberar uploads.",
      });
    }

    const creatorLimit = await CreatorLimit.findOne({ creatorId });

    if (!creatorLimit) {
      return res.status(404).json({
        success: false,
        message: "Criador não encontrado",
      });
    }

    await creatorLimit.allowUpload();

    res.json({
      success: true,
      message: "Upload liberado com sucesso",
      restrictions: creatorLimit.restrictions,
    });
  } catch (error) {
    console.error("Allow creator upload error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao liberar upload do criador",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all creators with their limits (admin only)
 */
export const getAllCreatorsLimits: RequestHandler = async (req, res) => {
  try {
    const requesterRole = (req as any).user?.role;

    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado. Apenas administradores podem ver todos os criadores.",
      });
    }

    const {
      page = 1,
      limit = 20,
      sortBy = "storageUsed",
      sortOrder = "desc",
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    const sort: any = {};
    sort[String(sortBy)] = sortOrder === "desc" ? -1 : 1;

    const creators = await CreatorLimit.find()
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const totalCreators = await CreatorLimit.countDocuments();
    const totalPages = Math.ceil(totalCreators / Number(limit));

    // Get video counts for each creator
    const creatorsWithStats = await Promise.all(
      creators.map(async (creator) => {
        const videoStats = await Video.aggregate([
          { $match: { creatorId: creator.creatorId } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]);

        const videosByStatus = videoStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as any);

        return {
          creatorId: creator.creatorId,
          creatorName: creator.creatorName,
          storageUsedGB: creator.getStorageUsedGB(),
          storageLimitGB: creator.getStorageLimitGB(),
          storageUsedPercentage: creator.getStorageUsedPercentage(),
          videoCount: creator.videoCount,
          videoCountLimit: creator.videoCountLimit,
          graceMonthsLeft: creator.graceMonthsLeft,
          isGracePeriod: creator.isGracePeriod,
          totalRevenue: creator.totalRevenue,
          totalViews: creator.totalViews,
          currentCommissionRate: creator.currentCommissionRate,
          restrictions: creator.restrictions,
          lastUploadAt: creator.lastUploadAt,
          createdAt: creator.createdAt,
          videosByStatus,
        };
      }),
    );

    // Get platform statistics
    const platformStats = await CreatorLimit.aggregate([
      {
        $group: {
          _id: null,
          totalCreators: { $sum: 1 },
          totalStorageUsed: { $sum: "$storageUsed" },
          totalVideoCount: { $sum: "$videoCount" },
          totalRevenue: { $sum: "$totalRevenue" },
          totalViews: { $sum: "$totalViews" },
          gracePeriodCreators: {
            $sum: { $cond: ["$isGracePeriod", 1, 0] },
          },
          restrictedCreators: {
            $sum: {
              $cond: [{ $eq: ["$restrictions.canUpload", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      creators: creatorsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCreators,
        pages: totalPages,
      },
      platformStats: platformStats[0] || {
        totalCreators: 0,
        totalStorageUsed: 0,
        totalVideoCount: 0,
        totalRevenue: 0,
        totalViews: 0,
        gracePeriodCreators: 0,
        restrictedCreators: 0,
      },
    });
  } catch (error) {
    console.error("Get all creators limits error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar limites dos criadores",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Check if creator can upload video
 */
export const checkUploadCapacity: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { fileSize } = req.body;
    const requesterId = (req as any).user?.id;
    const requesterRole = (req as any).user?.role;

    // Check if user can check this creator's capacity
    if (requesterId !== creatorId && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado.",
      });
    }

    if (!fileSize || fileSize <= 0) {
      return res.status(400).json({
        success: false,
        message: "Tamanho do arquivo é obrigatório",
      });
    }

    const creatorLimit = await CreatorLimit.getOrCreateForCreator(
      creatorId,
      "Creator",
    );

    const uploadCheck = creatorLimit.canUploadVideo(Number(fileSize));

    res.json({
      success: true,
      canUpload: uploadCheck.canUpload,
      reason: uploadCheck.reason,
      limits: {
        storageUsedGB: creatorLimit.getStorageUsedGB(),
        storageLimitGB: creatorLimit.getStorageLimitGB(),
        storageUsedPercentage: creatorLimit.getStorageUsedPercentage(),
        videoCount: creatorLimit.videoCount,
        videoCountLimit: creatorLimit.videoCountLimit,
        remainingStorageGB: creatorLimit.remainingStorageGB,
      },
    });
  } catch (error) {
    console.error("Check upload capacity error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar capacidade de upload",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update all grace periods (cron job endpoint)
 */
export const updateAllGracePeriods: RequestHandler = async (req, res) => {
  try {
    const requesterRole = (req as any).user?.role;

    if (requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado. Apenas administradores podem executar esta função.",
      });
    }

    await CreatorLimit.updateAllGracePeriods();

    res.json({
      success: true,
      message: "Períodos de carência atualizados com sucesso",
    });
  } catch (error) {
    console.error("Update all grace periods error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar períodos de carência",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
