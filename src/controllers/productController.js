const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const CustomError = require('../utils/CustomError');
const { stripSupplierCodes, looksLikeSupplierCode } = require('../utils/supplierCodes');
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

const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'];
const isStaffRequest = (request) => STAFF_ROLES.includes(request.user?.role);

const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Short terms must start a word ("gl" should not hit "anGLe" or "sinGLe"); longer ones match anywhere.
const publicMatcher = (term) => {
  const body = escapeRegExp(term.toLowerCase());
  const rx = term.length < 4 ? new RegExp(`(^|[^a-z0-9])${body}`, 'i') : new RegExp(body, 'i');
  return (text) => rx.test(String(text || ''));
};

// What a shopper may see of a part: Aurex numbers only. Supplier codes are stripped from
// every display string and the OEM / alternate-number fields are left out altogether.
const toPublic = (normalized, source) => {
  const own = [source.oem, source.oemPartNumber, ...(source.alternatePartNumbers || [])];
  const clean = (text) => stripSupplierCodes(text, own);
  const out = {
    ...normalized,
    name: clean(normalized.name),
    desc: clean(normalized.desc),
    description: clean(normalized.description),
    shortDescription: clean(normalized.shortDescription)
  };
  if (out.seo && typeof out.seo === 'object') {
    out.seo = Object.fromEntries(Object.entries(out.seo).map(([k, v]) => [k, clean(v)]));
  }
  delete out.oem;
  delete out.oemPartNumber;
  delete out.alternatePartNumbers;
  // The manufacturer behind a part is supplier information too: shoppers see the house brand.
  out.brand = 'Aurex';
  out.brandName = 'Aurex';
  return out;
};

const CARD_FIELDS = 'sku name slug category categorySlug sub brandName fit oem oemPartNumber stockStatus lead badge badges ' +
  'pricing.sellingPrice pricing.mrp pricing.isPOA images inventory.stock rating reviewCount specs ' +
  'isFeatured isBestSeller isBuyable status shortDescription';

const toCard = (p) => {
  const n = toPublic(normalizeProduct(p), p);
  const first = Array.isArray(p.images) ? p.images[0] : null;
  const url = first ? (first.url || first) : '';
  return { ...n, images: url ? [{ url }] : [], imageUrl: url, desc: n.shortDescription || '' };
};

const getProducts = async (request, reply, { staffView = false } = {}) => {
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

  // The shop catalogue is identical for every caller, staff included. Only the admin
  // route (which requires a staff login) asks for the staff view.
  const isStaff = staffView && isStaffRequest(request);

  // Shoppers only ever see published parts; staff tools can list drafts and archived lines too.
  const query = {};
  if (!isStaff) {
    query.status = 'PUBLISHED';
  } else if (request.query?.status) {
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

  // Search. Staff can find a part by any number we hold for it. Shoppers search Aurex
  // numbers and descriptions only: a supplier code, or the start of one, finds nothing.
  const term = String(search || '').trim().slice(0, 80);
  const matchesPublicText = term ? publicMatcher(term) : null;
  if (term) {
    if (!isStaff && looksLikeSupplierCode(term)) {
      return reply.send({
        success: true,
        count: 0,
        data: { products: [], pagination: { total: 0, page: 1, pages: 0, limit: Number(limit) || 0 } }
      });
    }
    const rx = { $regex: escapeRegExp(term), $options: 'i' };
    query.$or = isStaff
      ? [{ sku: rx }, { oemPartNumber: rx }, { alternatePartNumbers: rx }, { name: rx }, { description: rx }]
      : [{ sku: rx }, { name: rx }, { sub: rx }, { fit: rx }, { shortDescription: rx }];
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
  let find = Product.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(parsedLimit);

  // Listing pages only draw cards, so the public list carries card fields once.
  // (The full document was ~8 KB per part and was sent three times over.)
  find = isStaff
    ? find.populate('categories', 'name slug').populate('brand', 'name slug logo')
    : find.select(CARD_FIELDS).lean();

  const products = await find;
  let items = isStaff ? products.map(normalizeProduct) : products.map(toCard);
  // Second pass on what the shopper will actually be shown, so text that only matched
  // through something we strip (a code still sitting in a stored name) is dropped too.
  if (matchesPublicText && !isStaff) {
    items = items.filter((c) => matchesPublicText(`${c.sku} ${c.name} ${c.sub || ''} ${c.fit || ''} ${c.shortDescription || ''}`));
  }

  reply.send({
    success: true,
    count: items.length,
    ...(isStaff ? { items } : {}),
    data: {
      products: items,
      pagination: {
        total: matchesPublicText && !isStaff ? items.length : total,
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
  }).limit(4).select('name sku oem oemPartNumber alternatePartNumbers pricing images condition status');

  if (product.status !== 'PUBLISHED') {
    throw new CustomError('Truck part not found', 404, 'PRODUCT_NOT_FOUND');
  }
  const present = (doc) => toPublic(normalizeProduct(doc), doc);
  const normalized = present(product);

  reply.send({
    success: true,
    product: normalized,
    data: {
      product: normalized,
      relatedProducts: relatedProducts.map(present)
    }
  });
};

const crossReferenceLookup = async (request, reply) => {
  const { partNumber } = request.query || {};
  if (!partNumber) {
    throw new CustomError('Please provide a part number or OEM cross-reference', 400, 'MISSING_PARAM');
  }

  // Public lookup: Aurex numbers only. Supplier numbers are searchable from the admin product list.
  const rx = { $regex: escapeRegExp(partNumber.trim().toUpperCase()), $options: 'i' };
  const products = await Product.find({ status: 'PUBLISHED', sku: rx }).populate('brand', 'name slug').limit(10);

  const items = products.map((doc) => toPublic(normalizeProduct(doc), doc));

  reply.send({
    success: true,
    searchedPartNumber: partNumber,
    count: items.length,
    items,
    data: { products: items, items }
  });
};

const adminGetProducts = (request, reply) => getProducts(request, reply, { staffView: true });

const DB_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

// Staff tools send storefront-shaped products (price, category slug, stock label...).
// Only fields that were actually sent are translated, so a partial edit can never
// reset the price, trade price, RRP or publication state of an existing part.
const prepareProductPayload = async (body, existing = null) => {
  const p = { ...body };
  for (const key of ['_id', 'id', 'reviews', 'slug', 'createdAt', 'updatedAt', '__v']) delete p[key];

  if (p.sku) p.sku = String(p.sku).trim().toUpperCase();
  if (p.name) p.name = String(p.name).trim();

  // "In stock VIC" / "Built to order" / "Enquiry" are stock labels, not publication status.
  const label = typeof p.status === 'string' && !DB_STATUSES.includes(p.status) ? p.status : null;
  if (label) {
    if (label !== 'Enquiry') p.stockStatus = label;
    delete p.status;
  }
  if (!existing && !p.status) p.status = 'PUBLISHED';

  // Price & Pricing
  if ('price' in p || label === 'Enquiry') {
    const isPOA = p.price === null || p.price === '' || label === 'Enquiry';
    const priceNum = isPOA ? 0 : Number(p.price);
    if (!isPOA && !(priceNum >= 0)) {
      throw new CustomError('Price must be a number.', 400, 'INVALID_PRICE');
    }
    const current = existing?.pricing?.toObject ? existing.pricing.toObject() : {};
    p.pricing = {
      ...current,
      sellingPrice: priceNum,
      isPOA,
      // A higher RRP that was already set is kept; otherwise it follows the selling price.
      mrp: current.mrp > priceNum ? current.mrp : priceNum
    };
  }
  delete p.price;

  // Category
  if (p.category !== undefined) {
    const ref = p.category && typeof p.category === 'object' ? (p.category._id || p.category.slug) : p.category;
    const cat = ref
      ? await Category.findOne(OBJECT_ID.test(String(ref)) ? { _id: ref } : { slug: String(ref) })
      : null;
    if (cat) {
      p.category = cat._id;
      p.categories = [cat._id];
      p.categorySlug = cat.slug;
    } else {
      delete p.category;
    }
  }

  // Brand and sub-category arrive as display names from the storefront tools
  if (p.brand !== undefined) {
    if (p.brand && typeof p.brand === 'object') {
      p.brandName = p.brand.name || p.brandName;
      p.brand = p.brand._id;
    } else if (!OBJECT_ID.test(String(p.brand || ''))) {
      if (p.brand) p.brandName = String(p.brand);
      delete p.brand;
    }
    if (!p.brand) delete p.brand;
  }
  if (typeof p.subCategory === 'string' && !OBJECT_ID.test(p.subCategory)) {
    p.sub = p.sub || p.subCategory;
    delete p.subCategory;
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

  const updateData = await prepareProductPayload(request.body || {}, product);

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
