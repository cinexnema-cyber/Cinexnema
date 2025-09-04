import type { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "thumbnails");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `thumb-${unique}${ext}`);
  },
});

function imageFilter(_req: any, file: Express.Multer.File, cb: any) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Formato de imagem inválido"));
}

export const thumbnailUpload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadThumbnail: RequestHandler = async (req, res) => {
  try {
    const f = (req as any).file as Express.Multer.File | undefined;
    if (!f) return res.status(400).json({ success: false, message: "Arquivo não enviado" });
    const base = (process.env.FRONTEND_URL || "http://localhost:8080").replace(/\/$/, "");
    const url = `${base}/uploads/thumbnails/${path.basename(f.path)}`;
    res.json({ success: true, url });
  } catch (e: any) {
    res.status(500).json({ success: false, message: "Erro no upload da miniatura", error: e?.message || String(e) });
  }
};
