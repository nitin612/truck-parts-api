import Promo from "../models/Promo.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/** GET /api/promos/active — public; storefront popup + checkout promo list. */
export const listActivePromos = asyncHandler(async (_req, res) => {
  const items = await Promo.find({ active: true }).sort({ pct: -1 }).lean();
  res.json({ ok: true, items: items.map((p) => ({ code: p.code, label: p.label, pct: p.pct, active: true })) });
});

/** POST /api/promos/validate — public; checkout checks a code here. */
export const validatePromo = asyncHandler(async (req, res) => {
  const code = String(req.body.code).toUpperCase();
  const promo = await Promo.findOne({ code, active: true }).lean();
  if (!promo) throw ApiError.badRequest("That code is not active. Check the spelling or ask the counter.");
  res.json({ ok: true, promo: { code: promo.code, label: promo.label, pct: promo.pct } });
});

/* ---------------- Admin ---------------- */
export const listPromos = asyncHandler(async (_req, res) => {
  const items = await Promo.find().sort({ createdAt: 1 }).lean();
  res.json({ ok: true, items });
});

export const createPromo = asyncHandler(async (req, res) => {
  const promo = await Promo.create({ ...req.body, code: req.body.code.toUpperCase() });
  res.status(201).json({ ok: true, promo });
});

export const updatePromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findOneAndUpdate(
    { code: String(req.params.code).toUpperCase() },
    req.body,
    { new: true, runValidators: true }
  );
  if (!promo) throw ApiError.notFound("Promo not found.");
  res.json({ ok: true, promo });
});

export const deletePromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findOneAndDelete({ code: String(req.params.code).toUpperCase() });
  if (!promo) throw ApiError.notFound("Promo not found.");
  res.json({ ok: true, message: "Promo deleted." });
});
