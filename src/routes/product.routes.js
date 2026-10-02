import { Router } from "express";
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { productCreateSchema, productUpdateSchema } from "../validators/index.js";

const r = Router();
// Public
r.get("/", listProducts);
r.get("/:sku", getProduct);
// Admin
r.post("/", requireAuth, requireAdmin, validate(productCreateSchema), createProduct);
r.put("/:sku", requireAuth, requireAdmin, validate(productUpdateSchema), updateProduct);
r.delete("/:sku", requireAuth, requireAdmin, deleteProduct);
export default r;
