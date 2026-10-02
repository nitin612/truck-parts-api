import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import orderRoutes from "./order.routes.js";
import promoRoutes from "./promo.routes.js";
import enquiryRoutes from "./enquiry.routes.js";
import settingRoutes from "./setting.routes.js";
import adminRoutes from "./admin.routes.js";
import paymentRoutes from "./payment.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "truck-parts-api", time: new Date().toISOString() }));

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/promos", promoRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/settings", settingRoutes);
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);
router.use("/uploads", uploadRoutes);

export default router;
