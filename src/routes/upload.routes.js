import { Router } from "express";
import { uploadImage } from "../middleware/upload.js";
import { uploadHandler } from "../controllers/upload.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const r = Router();
// Admin-only image upload. multer parses the multipart body before the handler.
r.post("/", requireAuth, requireAdmin, uploadImage, uploadHandler);
export default r;
