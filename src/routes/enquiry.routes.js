import { Router } from "express";
import {
  createEnquiry, listEnquiries, setEnquiryStatus,
} from "../controllers/enquiry.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { enquiryCreateSchema, enquiryStatusSchema } from "../validators/index.js";

const r = Router();
r.post("/", validate(enquiryCreateSchema), createEnquiry); // public
r.get("/", requireAuth, requireAdmin, listEnquiries);
r.patch("/:ref/status", requireAuth, requireAdmin, validate(enquiryStatusSchema), setEnquiryStatus);
export default r;
