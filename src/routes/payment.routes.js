import { Router } from "express";
import { createIntent, createCheckoutSession } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.js";

// NOTE: the Stripe webhook needs a RAW body, so it is mounted separately in
// app.js (before the JSON parser). This router only holds JSON endpoints.
const r = Router();
r.post("/create-intent", optionalAuth, createIntent);
r.post("/create-checkout-session", optionalAuth, createCheckoutSession);
export default r;
