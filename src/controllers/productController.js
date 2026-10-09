const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');

const normalizeProduct = (p) => {
  if (!p) return p;
  const obj = p.toObject ? p.toObject() : p;
  const catSlug = (typeof obj.category === 'object' && obj.category?.slug)
    ? obj.category.slug
    : (typeof obj.category === 'string' ? obj.category : (obj.categories?.[0]?.slug || 'accessories'));

  const imgs = Array.isArray(obj.images)
    ? obj.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : [];

  const priceVal = obj.pricing?.isPOA ? null : (obj.pricing?.sellingPrice ?? obj.price ?? 0);

  return {
    ...obj,
    id: obj.sku || String(obj._id),
    sku: obj.sku || '',
    name: obj.name || '',
    price: priceVal,
    category: catSlug || 'accessories',
    sub: obj.subCategory || obj.sub || '',
    brand: obj.brandName || (obj.brand?.name) || obj.brand || '',
    fit: obj.fitmentSummary || obj.fit || '',
    oem: obj.oemPartNumber || obj.oem || '',
    status: obj.pricing?.isPOA ? 'Enquiry' : (obj.status === 'PUBLISHED' ? 'In stock VIC' : (obj.status || 'In stock VIC')),
    lead: obj.leadTimeDays ? `${obj.leadTimeDays} days` : (obj.lead || ''),
    rating: obj.rating ?? 4.8,
    reviews: obj.reviewCount ?? obj.reviews ?? 12,
    badge: obj.isFeatured ? 'Popular' : (obj.badge || ''),
    desc: obj.description || obj.desc || '',
    specs: obj.technicalSpecifications || obj.specs || {},
    images: imgs.length ? imgs : (obj.image ? [obj.image] : [])
  };
};

const getProducts = async (request, reply) => {
  const {
    category,
    brand,
    make,
    model,
    year,
    condition,
    placement,
    search,
    minPrice,
    maxPrice,
    inStock,
    isFeatured,
    isNewProduct,
    isPOA,
    sort = 'newest',
    page = 1,
    limit = 500
  } = request.query || {};

  const query = {};
  if (request.query?.status) {
    query.status = request.query.status;
  }

  if (category && category !== 'All') {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
    const cat = await Category.findOne({ $or: [{ _id: isObjectId ? category : null }, { slug: category }] });
    if (cat) query.categories = cat._id;
  }

  if (brand) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(brand);
    const br = await Brand.findOne({ $or: [{ _id: isObjectId ? brand : null }, { slug: brand }] });
    if (br) query.brand = br._id;
  }

  if (make) query['fitments.make'] = { $regex: new RegExp(`^${make}$`, 'i') };
  if (model) query['fitments.model'] = { $regex: new RegExp(model, 'i') };
  if (year) {
    const numYear = parseInt(year, 10);
    query['fitments.yearFrom'] = { $lte: numYear };
    query['fitments.yearTo'] = { $gte: numYear };
  }

  if (condition) query.condition = condition;
  if (placement) query.placementPosition = placement;
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (isNewProduct !== undefined) query.isNewProduct = isNewProduct === 'true';
  if (isPOA !== undefined) query['pricing.isPOA'] = isPOA === 'true';
  if (inStock === 'true') query['inventory.stock'] = { $gt: 0 };

  if (minPrice || maxPrice) {
    query['pricing.sellingPrice'] = {};
    if (minPrice) query['pricing.sellingPrice'].$gte = Number(minPrice);
    if (maxPrice) query['pricing.sellingPrice'].$lte = Number(maxPrice);
  }

  if (search) {
    query.$or = [
      { sku: { $regex: search, $options: 'i' } },
      { oemPartNumber: { $regex: search, $options: 'i' } },
      { alternatePartNumbers: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let sortOption = { sku: 1 };
  if (sort === 'price_asc') sortOption = { 'pricing.sellingPrice': 1 };
  else if (sort === 'price_desc') sortOption = { 'pricing.sellingPrice': -1 };
  else if (sort === 'name_asc') sortOption = { name: 1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'popular') sortOption = { reviewCount: -1, rating: -1 };

  const parsedLimit = Math.min(2000, Number(limit) || 500);
  const skip = (Number(page) - 1) * parsedLimit;
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('categories', 'name slug')
    .populate('brand', 'name slug logo')
    .sort(sortOption)
    .skip(skip)
    .limit(parsedLimit);

  const items = products.map(normalizeProduct);

  reply.send({
    success: true,
    count: items.length,
    items,
    data: {
      products: items,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / parsedLimit),
        limit: parsedLimit
      }
    }
  });
};

const getProductBySkuOrSlug = async (request, reply) => {
  const { identifier } = request.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  const product = await Product.findOne({
    $or: [
      ...(isObjectId ? [{ _id: identifier }] : []),
      { sku: identifier.toUpperCase() },
      { slug: identifier }
    ]
  })
    .populate('category', 'name slug')
    .populate('categories', 'name slug')
    .populate('brand', 'name slug logo website originCountry');

  if (!product) {
    throw new CustomError('Truck part not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const relatedProducts = await Product.find({
    category: product.category?._id,
    _id: { $ne: product._id },
    status: 'PUBLISHED'
  }).limit(4).select('name sku oemPartNumber pricing images condition');

  const normalized = normalizeProduct(product);

  reply.send({
    success: true,
    product: normalized,
    data: {
      product: normalized,
      relatedProducts: relatedProducts.map(normalizeProduct)
    }
  });
};

const crossReferenceLookup = async (request, reply) => {
  const { partNumber } = request.query || {};
  if (!partNumber) {
    throw new CustomError('Please provide a part number or OEM cross-reference', 400, 'MISSING_PARAM');
  }

  const clean = partNumber.trim().toUpperCase();
  const products = await Product.find({
    status: 'PUBLISHED',
    $or: [
      { sku: { $regex: clean, $options: 'i' } },
      { oemPartNumber: { $regex: clean, $options: 'i' } },
      { alternatePartNumbers: { $regex: clean, $options: 'i' } }
    ]
  }).populate('brand', 'name slug').limit(10);

  const items = products.map(normalizeProduct);

  reply.send({
    success: true,
    searchedPartNumber: partNumber,
    count: items.length,
    items,
    data: { products: items, items }
  });
};

const adminGetProducts = getProducts;

const prepareProductPayload = async (body) => {
  const p = { ...body };

  if (p.sku) p.sku = p.sku.trim().toUpperCase();
  if (p.name) p.name = p.name.trim();

  // Price & Pricing
  const isPOA = p.price === null || p.status === 'Enquiry';
  const priceNum = isPOA ? 0 : (Number(p.price) || 0);
  p.pricing = {
    mrp: priceNum,
    sellingPrice: priceNum,
    tradePrice: Math.round(priceNum * 0.85),
    isPOA,
    discountType: 'NONE',
    discountValue: 0
  };

  // Category
  if (p.category) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(p.category);
    const cat = await Category.findOne({ $or: [{ _id: isObjectId ? p.category : null }, { slug: p.category }] });
    if (cat) {
      p.category = cat._id;
      p.categories = [cat._id];
    }
  }

  // Images
  if (Array.isArray(p.images)) {
    p.images = p.images.map((img, i) => {
      if (typeof img === 'string') {
        return { url: img, publicId: `img_${Date.now()}_${i}`, isPrimary: i === 0 };
      }
      return img;
    });
  }

  if (p.desc) p.description = p.desc;
  if (p.oem) p.oemPartNumber = p.oem;
  if (p.brand) p.brandName = p.brand;
  if (p.fit) p.fitmentSummary = p.fit;
  if (p.specs && typeof p.specs === 'object') p.technicalSpecifications = p.specs;

  p.status = 'PUBLISHED';
  return p;
};

const adminCreateProduct = async (request, reply) => {
  const rawData = request.body || {};
  const productData = await prepareProductPayload(rawData);

  // Check existing SKU
  const existing = await Product.findOne({ sku: productData.sku });
  if (existing) {
    throw new CustomError(`Product with SKU ${productData.sku} already exists`, 400, 'SKU_EXISTS');
  }

  const product = await Product.create(productData);
  const normalized = normalizeProduct(product);

  reply.status(201).send({
    success: true,
    message: 'Truck part created successfully',
    product: normalized,
    data: { product: normalized }
  });
};

const adminUpdateProduct = async (request, reply) => {
  const ref = request.params.id || request.params.sku || request.params.identifier;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(ref);

  const product = await Product.findOne({
    $or: [
      { sku: ref.toUpperCase() },
      ...(isObjectId ? [{ _id: ref }] : [])
    ]
  });

  if (!product) throw new CustomError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const updateData = await prepareProductPayload(request.body || {});
  delete updateData._id;

  Object.assign(product, updateData);
  await product.save();

  const normalized = normalizeProduct(product);

  reply.send({
    success: true,
    message: 'Truck part updated successfully',
    product: normalized,
    data: { product: normalized }
  });
};

const adminDeleteProduct = async (request, reply) => {
  const ref = request.params.id || request.params.sku || request.params.identifier;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(ref);

  const product = await Product.findOne({
    $or: [
      { sku: ref.toUpperCase() },
      ...(isObjectId ? [{ _id: ref }] : [])
    ]
  });

  if (!product) throw new CustomError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  await product.deleteOne();
  reply.send({ success: true, message: 'Truck part deleted successfully' });
};

module.exports = {
  getProducts,
  getProductBySkuOrSlug,
  crossReferenceLookup,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  normalizeProduct
};
