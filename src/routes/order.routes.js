import { Router } from "express";
import {
  createOrder, myOrders, trackOrder, listOrders, getOrder, updateOrderStatus,
} from "../controllers/order.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";
import { orderCreateSchema, orderStatusSchema } from "../validators/index.js";

const r = Router();
// Public / customer
r.post("/", optionalAuth, validate(orderCreateSchema), createOrder); // guest or logged-in
r.get("/track/:ref", trackOrder); // public tracking by ref
r.get("/mine", requireAuth, myOrders);
// Admin
r.get("/", requireAuth, requireAdmin, listOrders);
r.get("/:ref", requireAuth, requireAdmin, getOrder);
r.patch("/:ref/status", requireAuth, requireAdmin, validate(orderStatusSchema), updateOrderStatus);
export default r;
