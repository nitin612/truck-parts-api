const Brand = require('../models/Brand');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');

const getBrands = async (request, reply) => {
  const { type, isFeatured, search } = request.query;
  const filter = { isActive: true };

  if (type) filter.type = type;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (search) filter.name = { $regex: search, $options: 'i' };

  const brands = await Brand.find(filter).sort({ name: 1 });
  reply.send({ success: true, count: brands.length, data: { brands } });
};

const getBrandBySlug = async (request, reply) => {
  const brand = await Brand.findOne({ slug: request.params.slug, isActive: true });
  if (!brand) throw new CustomError('Brand not found', 404, 'BRAND_NOT_FOUND');
  reply.send({ success: true, data: { brand } });
};

const adminGetBrands = async (request, reply) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  reply.send({ success: true, count: brands.length, data: { brands } });
};

const adminCreateBrand = async (request, reply) => {
  const brandData = request.body || {};

  if (request.file) {
    const uploaded = await uploadImage(request.file.path, 'truck-parts/brands');
    brandData.logo = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  const brand = await Brand.create(brandData);
  reply.status(201).send({ success: true, message: 'Brand created successfully', data: { brand } });
};

const adminUpdateBrand = async (request, reply) => {
  const brand = await Brand.findById(request.params.id);
  if (!brand) throw new CustomError('Brand not found', 404, 'BRAND_NOT_FOUND');

  const updateData = request.body || {};

  if (request.file) {
    if (brand.logo?.publicId) await deleteImage(brand.logo.publicId);
    const uploaded = await uploadImage(request.file.path, 'truck-parts/brands');
    updateData.logo = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  Object.assign(brand, updateData);
  await brand.save();

  reply.send({ success: true, message: 'Brand updated successfully', data: { brand } });
};

const adminDeleteBrand = async (request, reply) => {
  const brand = await Brand.findById(request.params.id);
  if (!brand) throw new CustomError('Brand not found', 404, 'BRAND_NOT_FOUND');

  if (brand.logo?.publicId) await deleteImage(brand.logo.publicId);
  await brand.deleteOne();

  reply.send({ success: true, message: 'Brand deleted successfully' });
};

module.exports = {
  getBrands,
  getBrandBySlug,
  adminGetBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand
};
