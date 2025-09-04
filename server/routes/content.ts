import Joi from "joi";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

interface IContent {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  status: "pending" | "approved" | "rejected";
  category: "series" | "movie" | "documentary" | "short" | string;
  tags: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  views: number;
  earnings: number;
  uploadDate: Date;
  approvedDate?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  muxAssetId?: string;
  muxPlaybackId?: string;
  muxUploadId?: string;
  metadata?: Record<string, any>;
}

const contents: IContent[] = [];

function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

class ContentModel {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  status: IContent["status"];
  category: IContent["category"];
  tags: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  views: number;
  earnings: number;
  uploadDate: Date;
  approvedDate?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  muxAssetId?: string;
  muxPlaybackId?: string;
  muxUploadId?: string;
  metadata?: Record<string, any>;

  constructor(data: Partial<IContent> & { title: string; description: string; category: string; creatorId: string }) {
    this._id = genId();
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.creatorId = data.creatorId;
    this.status = (data.status as any) ?? "pending";
    this.tags = data.tags ?? [];
    this.thumbnailUrl = data.thumbnailUrl;
    this.videoUrl = data.videoUrl;
    this.duration = data.duration;
    this.views = data.views ?? 0;
    this.earnings = data.earnings ?? 0;
    this.uploadDate = data.uploadDate ?? new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.muxAssetId = data.muxAssetId;
    this.muxPlaybackId = data.muxPlaybackId;
    this.muxUploadId = data.muxUploadId;
    this.metadata = data.metadata || {};
  }

  async save() {
    const idx = contents.findIndex((c) => c._id === this._id);
    const record: IContent = { ...this } as any;
    if (idx >= 0) contents[idx] = record; else contents.push(record);
    return this;
  }

  static async findById(id: string) {
    const c = contents.find((x) => x._id === id);
    return c ? ContentModel.fromRecord(c) : null;
  }

  static find(filter: Partial<Record<string, any>>) {
    let results = contents.slice();
    if (filter.creatorId) results = results.filter((c) => c.creatorId === filter.creatorId);
    if (filter.status) results = results.filter((c) => c.status === filter.status);

    const mapped = results.map(ContentModel.fromRecord);

    return {
      sort: (criteria: any) => {
        const key = Object.keys(criteria || {})[0] as keyof IContent | undefined;
        const dir = key ? (criteria[key as any] as any) : -1;
        const sorted = key
          ? mapped.sort((a, b) => (dir < 0 ? Number(b[key] > a[key]) - 1 : Number(a[key] > b[key]) - 1))
          : mapped;
        return {
          populate: async (_path?: string, _select?: string) => sorted,
        } as any;
      },
      populate: async (_path?: string, _select?: string) => mapped,
    } as any;
  }

  private static fromRecord(r: IContent) {
    const i = new ContentModel({
      title: r.title,
      description: r.description,
      category: r.category,
      creatorId: r.creatorId,
      status: r.status,
      tags: r.tags,
      thumbnailUrl: r.thumbnailUrl,
      videoUrl: r.videoUrl,
      duration: r.duration,
      views: r.views,
      earnings: r.earnings,
      uploadDate: r.uploadDate,
      muxAssetId: r.muxAssetId,
      muxPlaybackId: r.muxPlaybackId,
      muxUploadId: r.muxUploadId,
      metadata: r.metadata || {},
    } as any);
    i._id = r._id;
    i.createdAt = r.createdAt;
    i.updatedAt = r.updatedAt;
    i.approvedBy = r.approvedBy;
    i.approvedDate = r.approvedDate;
    return i;
  }
}

// Validation schemas
const uploadContentSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string()
    .valid("series", "movie", "documentary", "short")
    .required(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  thumbnailUrl: Joi.string().uri().optional(),
  videoUrl: Joi.string().uri().optional(),
  duration: Joi.number().positive().optional(),
});

export const uploadContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = uploadContentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      title,
      description,
      category,
      tags,
      thumbnailUrl,
      videoUrl,
      duration,
    } = value;
    const creatorId = req.userId as string;

    if (!creatorId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Create new content
    const content = new ContentModel({
      title,
      description,
      category,
      tags: tags || [],
      thumbnailUrl,
      videoUrl,
      duration,
      creatorId,
      status: "pending",
    } as any);

    await content.save();

    // Update creator's content count
    const User = require("../models/User").default;
    await User.findByIdAndUpdate(creatorId, {
      $inc: { "content.totalVideos": 1 },
    });

    res.status(201).json({
      success: true,
      message: "Conteúdo enviado para aprovação",
      content: content,
    });
  } catch (error) {
    console.error("Upload content error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getCreatorContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const creatorId = req.userId as string;

    if (!creatorId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const content = await ContentModel.find({ creatorId })
      .sort({ createdAt: -1 })
      .populate("approvedBy", "name email");

    res.json({ content });
  } catch (error) {
    console.error("Get creator content error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const updateContentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Only admins can update content status
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const { contentId } = req.params;
    const { status } = req.body as { status: "approved" | "rejected"; feedback?: string };

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const content = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    content.status = status;
    if (status === "approved") {
      content.approvedDate = new Date();
      content.approvedBy = req.userId as string;
    }

    await content.save();

    // Update creator analytics if approved
    if (status === "approved") {
      const User = require("../models/User").default;
      await User.findByIdAndUpdate(content.creatorId, {
        $inc: {
          "content.totalVideos": 1,
          "content.totalViews": 0,
        },
      });
    }

    res.json({
      success: true,
      message: `Conteúdo ${status === "approved" ? "aprovado" : "rejeitado"} com sucesso`,
      content,
    });
  } catch (error) {
    console.error("Update content status error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getPendingContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Only admins can view pending content
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const pendingContent = await ContentModel.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("creatorId", "name email");

    res.json({ content: pendingContent });
  } catch (error) {
    console.error("Get pending content error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const recordView = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const content = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    // Increment view count
    content.views += 1;

    // Calculate earnings (example: R$0.01 per view)
    const earningsPerView = 0.01;
    content.earnings += earningsPerView;

    await content.save();

    // Update creator's total views and earnings
    const User = require("../models/User").default;
    await User.findByIdAndUpdate(content.creatorId, {
      $inc: {
        "content.totalViews": 1,
        "content.totalEarnings": earningsPerView,
        "content.monthlyEarnings": earningsPerView,
      },
    });

    res.json({
      success: true,
      views: content.views,
      earnings: content.earnings,
    });
  } catch (error) {
    console.error("Record view error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export default ContentModel as any;
