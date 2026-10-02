import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/setting.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { settingUpdateSchema } from "../validators/index.js";

const r = Router();
r.get("/", getSettings); // public
r.put("/", requireAuth, requireAdmin, validate(settingUpdateSchema), updateSettings);
export default r;
