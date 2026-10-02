import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { webhook } from "./controllers/payment.controller.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  // Allow uploaded images to be embedded from the storefront/admin on another origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());

  // Serve uploaded product images.
  app.use("/uploads", express.static(UPLOAD_DIR));

  // Stripe webhook MUST receive the raw body for signature verification,
  // so it is registered before the JSON parser.
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), webhook);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    cors({
      origin(origin, cb) {
        // allow same-origin / server-to-server (no origin) and whitelisted origins
        if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );

  if (env.nodeEnv !== "test") app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.get("/", (_req, res) => res.json({ ok: true, service: "Aurex Truck Parts API", docs: "/api/health" }));

  app.use("/api", apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
