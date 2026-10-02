import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/** GET /api/categories — public, with live product counts. */
export const listCategories = asyncHandler(async (_req, res) => {
  const cats = await Category.find().sort({ createdAt: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json({ ok: true, items: cats.map((c) => ({ ...c, count: countMap[c.slug] || 0 })) });
});

/* ---------------- Admin ---------------- */
export const createCategory = asyncHandler(async (req, res) => {
  const slug = req.body.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const category = await Category.create({ ...req.body, slug });
  res.status(201).json({ ok: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate({ slug: req.params.slug }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("Category not found.");
  res.json({ ok: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ slug: req.params.slug });
  if (!category) throw ApiError.notFound("Category not found.");
  res.json({ ok: true, message: "Category deleted." });
});
