import { Router } from "express";
import {
  validatePromo, listActivePromos, listPromos, createPromo, updatePromo, deletePromo,
} from "../controllers/promo.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { promoValidateSchema, promoCreateSchema, promoUpdateSchema } from "../validators/index.js";

const r = Router();
// Public
r.get("/active", listActivePromos);
r.post("/validate", validate(promoValidateSchema), validatePromo);
// Admin
r.get("/", requireAuth, requireAdmin, listPromos);
r.post("/", requireAuth, requireAdmin, validate(promoCreateSchema), createPromo);
r.put("/:code", requireAuth, requireAdmin, validate(promoUpdateSchema), updatePromo);
r.delete("/:code", requireAuth, requireAdmin, deletePromo);
export default r;
