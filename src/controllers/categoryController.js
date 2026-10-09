const Category = require('../models/Category');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const slugify = require('slugify');
const fs = require('fs');

const normalizeCategory = (cat, count = 0) => {
  const obj = cat.toObject ? cat.toObject() : cat;
  return {
    ...obj,
    id: obj.slug || String(obj._id),
    _id: obj._id,
    slug: obj.slug,
    name: obj.name,
    tag: obj.tag || '',
    blurb: obj.blurb || obj.description || '',
    count: count || obj.productCount || 0
  };
};

const getCategories = async (request, reply) => {
  const categories = await Category.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });

  // Get live product counts per category
  const counts = await Product.aggregate([
    { $match: { status: 'PUBLISHED' } },
    { $unwind: '$categories' },
    { $group: { _id: '$categories', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

  const items = categories.map((cat) => normalizeCategory(cat, countMap[cat._id.toString()] || 0));

  reply.send({
    success: true,
    count: items.length,
    items,
    data: {
      categories: items,
      items
    }
  });
};

const getCategoryBySlug = async (request, reply) => {
  const category = await Category.findOne({ slug: request.params.slug, isActive: true })
    .populate('parentCategory', 'name slug');
  if (!category) throw new CustomError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const subCategories = await Category.find({ parentCategory: category._id, isActive: true });
  reply.send({ success: true, data: { category, subCategories } });
};

const adminGetCategories = getCategories;

const adminCreateCategory = async (request, reply) => {
  const categoryData = { ...(request.body || {}) };
  if (!categoryData.name) {
    throw new CustomError('Category name is required', 400, 'NAME_REQUIRED');
  }

  if (!categoryData.slug) {
    categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });
  } else {
    categoryData.slug = slugify(categoryData.slug, { lower: true, strict: true });
  }

  if (categoryData.blurb && !categoryData.description) {
    categoryData.description = categoryData.blurb;
  }

  if (request.file) {
    const uploaded = await uploadImage(request.file.path, 'truck-parts/categories');
    categoryData.image = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  const category = await Category.create(categoryData);
  const normalized = normalizeCategory(category, 0);

  reply.status(201).send({
    success: true,
    message: 'Category created successfully',
    category: normalized,
    data: { category: normalized }
  });
};

const adminUpdateCategory = async (request, reply) => {
  const param = request.params.id || request.params.slug;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);

  const category = await Category.findOne({
    $or: [
      { slug: param },
      ...(isObjectId ? [{ _id: param }] : [])
    ]
  });

  if (!category) throw new CustomError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const updateData = { ...(request.body || {}) };
  if (updateData.blurb) updateData.description = updateData.blurb;

  if (request.file) {
    if (category.image?.publicId) await deleteImage(category.image.publicId);
    const uploaded = await uploadImage(request.file.path, 'truck-parts/categories');
    updateData.image = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  Object.assign(category, updateData);
  await category.save();

  const normalized = normalizeCategory(category, 0);

  reply.send({
    success: true,
    message: 'Category updated successfully',
    category: normalized,
    data: { category: normalized }
  });
};

const adminDeleteCategory = async (request, reply) => {
  const param = request.params.id || request.params.slug;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);

  const category = await Category.findOne({
    $or: [
      { slug: param },
      ...(isObjectId ? [{ _id: param }] : [])
    ]
  });

  if (!category) throw new CustomError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  if (category.image?.publicId) await deleteImage(category.image.publicId);
  await category.deleteOne();

  reply.send({ success: true, message: 'Category deleted successfully' });
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
};
