import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/products
 * Public catalogue with filtering, search, sort and pagination.
 * Query: category, q, brand, status, minPrice, maxPrice, buyable,
 *        sort (price|-price|rating|-rating|newest), page, limit
 */
export const listProducts = asyncHandler(async (req, res) => {
  const { category, q, brand, status, minPrice, maxPrice, buyable, sort } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 60));

  const filter = { active: true };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (status) filter.status = status;
  if (buyable === "true") filter.price = { ...(filter.price || {}), $ne: null };
  if (minPrice || maxPrice) {
    filter.price = filter.price || {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.$text = { $search: q };

  const sortMap = {
    price: { price: 1 },
    "-price": { price: -1 },
    rating: { rating: 1 },
    "-rating": { rating: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: 1 };

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ ok: true, items, page, limit, total, pages: Math.ceil(total / limit) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const sku = String(req.params.sku).toUpperCase();
  const product = await Product.findOne({ sku, active: true }).lean();
  if (!product) throw ApiError.notFound("Product not found.");
  res.json({ ok: true, product });
});

/* ---------------- Admin ---------------- */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, sku: req.body.sku.toUpperCase() });
  res.status(201).json({ ok: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const sku = String(req.params.sku).toUpperCase();
  const product = await Product.findOneAndUpdate({ sku }, req.body, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound("Product not found.");
  res.json({ ok: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const sku = String(req.params.sku).toUpperCase();
  const product = await Product.findOneAndDelete({ sku });
  if (!product) throw ApiError.notFound("Product not found.");
  res.json({ ok: true, message: "Product deleted." });
});
