import { Router } from "express";
import {
  listCategories, createCategory, updateCategory, deleteCategory,
} from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { categoryCreateSchema, categoryUpdateSchema } from "../validators/index.js";

const r = Router();
r.get("/", listCategories);
r.post("/", requireAuth, requireAdmin, validate(categoryCreateSchema), createCategory);
r.put("/:slug", requireAuth, requireAdmin, validate(categoryUpdateSchema), updateCategory);
r.delete("/:slug", requireAuth, requireAdmin, deleteCategory);
export default r;
