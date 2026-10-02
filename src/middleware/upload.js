import fs from "fs";
import path from "path";
import multer from "multer";
import ApiError from "../utils/ApiError.js";

/**
 * Local-disk image uploads. Files are written to ./uploads and served at
 * /uploads/<file>. This is intentionally storage-agnostic at the edges: to
 * move to S3 / Cloudinary later, swap this storage engine and the URL the
 * controller returns — nothing else changes.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const safe = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, safe);
  },
});

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest("Only JPG, PNG, WEBP, GIF or AVIF images are allowed."));
  },
}).single("image");
