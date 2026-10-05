const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');

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
    limit = 20
  } = request.query;

  const query = { status: 'PUBLISHED' };

  if (category) {
    // Find category ID or slug
    const cat = await Category.findOne({ $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }] });
    if (cat) query.categories = cat._id;
  }

  if (brand) {
    const br = await Brand.findOne({ $or: [{ _id: brand.match(/^[0-9a-fA-F]{24}$/) ? brand : null }, { slug: brand }] });
    if (br) query.brand = br._id;
  }

  // Truck Fitment Filtering
  if (make) {
    query['fitments.make'] = { $regex: new RegExp(`^${make}$`, 'i') };
  }
  if (model) {
    query['fitments.model'] = { $regex: new RegExp(model, 'i') };
  }
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

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { 'pricing.sellingPrice': 1 };
  else if (sort === 'price_desc') sortOption = { 'pricing.sellingPrice': -1 };
  else if (sort === 'name_asc') sortOption = { name: 1 };
  else if (sort === 'popular') sortOption = { reviewCount: -1, rating: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const getProductBySkuOrSlug = async (request, reply) => {
  const { identifier } = request.params;
  const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);

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

  // Fetch related products in the same category or brand
  const relatedProducts = await Product.find({
    category: product.category?._id,
    _id: { $ne: product._id },
    status: 'PUBLISHED'
  }).limit(4).select('name sku oemPartNumber pricing images condition');

  reply.send({
    success: true,
    data: {
      product,
      relatedProducts
    }
  });
};

const crossReferenceLookup = async (request, reply) => {
  const { partNumber } = request.query;
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

  reply.send({
    success: true,
    searchedPartNumber: partNumber,
    count: products.length,
    data: { products }
  });
};

const adminGetProducts = async (request, reply) => {
  const { search, category, status, page = 1, limit = 50 } = request.query;
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { sku: { $regex: search, $options: 'i' } },
      { oemPartNumber: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const adminCreateProduct = async (request, reply) => {
  const productData = request.body || {};

  // Parse JSON strings from multipart/form-data
  ['badges', 'features', 'specifications', 'sections', 'pricing', 'inventory', 'dimensions', 'fitments', 'bulkPricingTiers', 'coreDeposit', 'shippingInfo', 'warranty', 'seo', 'categories', 'alternatePartNumbers'].forEach(field => {
    if (typeof productData[field] === 'string') {
      try { productData[field] = JSON.parse(productData[field]); } catch (e) {}
    }
  });

  const images = [];
  if (request.files && request.files.length > 0) {
    for (const file of request.files) {
      const result = await uploadImage(file.path, 'truck-parts/products');
      images.push({
        url: result.url,
        publicId: result.publicId,
        isPrimary: images.length === 0
      });
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
  }

  if (images.length > 0) {
    productData.images = images;
  }

  const product = await Product.create(productData);

  reply.status(201).send({
    success: true,
    message: 'Truck part created successfully',
    data: { product }
  });
};

const adminUpdateProduct = async (request, reply) => {
  const product = await Product.findById(request.params.id);
  if (!product) throw new CustomError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  const updateData = request.body || {};

  ['badges', 'features', 'specifications', 'sections', 'pricing', 'inventory', 'dimensions', 'fitments', 'bulkPricingTiers', 'coreDeposit', 'shippingInfo', 'warranty', 'seo', 'categories', 'alternatePartNumbers'].forEach(field => {
    if (typeof updateData[field] === 'string') {
      try { updateData[field] = JSON.parse(updateData[field]); } catch (e) {}
    }
  });

  if (request.files && request.files.length > 0) {
    const newImages = [];
    for (const file of request.files) {
      const result = await uploadImage(file.path, 'truck-parts/products');
      newImages.push({
        url: result.url,
        publicId: result.publicId,
        isPrimary: (!product.images || product.images.length === 0) && newImages.length === 0
      });
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    updateData.images = [...(product.images || []), ...newImages];
  }

  Object.assign(product, updateData);
  await product.save();

  reply.send({
    success: true,
    message: 'Truck part updated successfully',
    data: { product }
  });
};

const adminDeleteProduct = async (request, reply) => {
  const product = await Product.findById(request.params.id);
  if (!product) throw new CustomError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.publicId) await deleteImage(img.publicId);
    }
  }

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
  adminDeleteProduct
};
