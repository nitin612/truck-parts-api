import { Router } from "express";
import {
  register, login, logout, refresh, me, forgotPassword, resetPassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
} from "../validators/index.js";

const r = Router();
r.post("/register", authLimiter, validate(registerSchema), register);
r.post("/login", authLimiter, validate(loginSchema), login);
r.post("/refresh", refresh);
r.post("/logout", logout);
r.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
r.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
r.get("/me", requireAuth, me);
export default r;
