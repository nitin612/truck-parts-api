const Category = require('../models/Category');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');

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
  counts.forEach(c => { countMap[c._id.toString()] = c.count; });

  const categoriesWithCounts = categories.map(cat => ({
    ...cat.toObject(),
    productCount: countMap[cat._id.toString()] || 0
  }));

  reply.send({ success: true, count: categoriesWithCounts.length, data: { categories: categoriesWithCounts } });
};

const getCategoryBySlug = async (request, reply) => {
  const category = await Category.findOne({ slug: request.params.slug, isActive: true })
    .populate('parentCategory', 'name slug');
  if (!category) throw new CustomError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const subCategories = await Category.find({ parentCategory: category._id, isActive: true });
  reply.send({ success: true, data: { category, subCategories } });
};

const adminGetCategories = async (request, reply) => {
  const categories = await Category.find()
    .populate('parentCategory', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 });
  reply.send({ success: true, count: categories.length, data: { categories } });
};

const adminCreateCategory = async (request, reply) => {
  const categoryData = request.body || {};

  if (request.file) {
    const uploaded = await uploadImage(request.file.path, 'truck-parts/categories');
    categoryData.image = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  const category = await Category.create(categoryData);
  reply.status(201).send({ success: true, message: 'Category created successfully', data: { category } });
};

const adminUpdateCategory = async (request, reply) => {
  const category = await Category.findById(request.params.id);
  if (!category) throw new CustomError('Category not found', 404, 'CATEGORY_NOT_FOUND');

  const updateData = request.body || {};

  if (request.file) {
    if (category.image?.publicId) await deleteImage(category.image.publicId);
    const uploaded = await uploadImage(request.file.path, 'truck-parts/categories');
    updateData.image = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  Object.assign(category, updateData);
  await category.save();

  reply.send({ success: true, message: 'Category updated successfully', data: { category } });
};

const adminDeleteCategory = async (request, reply) => {
  const category = await Category.findById(request.params.id);
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
