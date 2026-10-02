import { Router } from "express";
import { dashboardStats, listCustomers } from "../controllers/admin.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth, requireAdmin);
r.get("/stats", dashboardStats);
r.get("/customers", listCustomers);
export default r;
