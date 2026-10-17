const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CustomError = require('../utils/CustomError');

/**
 * Get reviews that the currently logged-in user needs to submit
 * for items from successfully delivered orders.
 */
const getPendingReviews = async (request, reply) => {
  const userId = request.user._id;

  // 1. Find all delivered orders for this user
  const deliveredOrders = await Order.find({
    user: userId,
    $or: [
      { orderStatus: 'Delivered' },
      { 'shipping.status': 'DELIVERED' }
    ]
  }).sort({ 'shipping.deliveredAt': -1, updatedAt: -1 }).lean();

  if (!deliveredOrders.length) {
    return reply.send({
      success: true,
      count: 0,
      data: { pendingReviews: [] }
    });
  }

  // 2. Find all reviews already written by this user
  const existingReviews = await Review.find({ user: userId }).select('product order orderNumber').lean();
  const reviewedProductIds = new Set(
    existingReviews.map(r => (r.product ? r.product.toString() : null)).filter(Boolean)
  );

  const pendingReviews = [];
  const seenProductIds = new Set();

  for (const order of deliveredOrders) {
    if (!order.items || !order.items.length) continue;

    for (const item of order.items) {
      let productIdStr = item.product ? item.product.toString() : null;

      // If item didn't store productId, resolve via SKU
      if (!productIdStr && item.sku) {
        const foundProd = await Product.findOne({ sku: item.sku }).select('_id').lean();
        if (foundProd) {
          productIdStr = foundProd._id.toString();
        }
      }

      // Check if already reviewed or already in pending list
      if (!productIdStr || reviewedProductIds.has(productIdStr) || seenProductIds.has(productIdStr)) {
        continue;
      }

      seenProductIds.add(productIdStr);
      pendingReviews.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveredAt: order.shipping?.deliveredAt || order.updatedAt,
        productId: productIdStr,
        name: item.name,
        sku: item.sku,
        image: item.image,
        unitPrice: item.unitPrice,
        brandName: item.brandName
      });
    }
  }

  reply.send({
    success: true,
    count: pendingReviews.length,
    data: { pendingReviews }
  });
};

/**
 * Create or update a genuine rating & review for a product.
 * - Star rating (1-5) is required.
 * - Comment/review text is optional.
 * - Recomputes product rating and reviewCount genuine totals.
 */
const createReview = async (request, reply) => {
  const { productId, orderId, rating, comment, title, truckModelReviewed } = request.body;
  const user = request.user;
  const userId = user._id;

  const numericRating = Number(rating);
  if (!numericRating || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new CustomError('Rating must be a number between 1 and 5 stars', 400, 'INVALID_RATING');
  }

  // Resolve product by ObjectId or SKU
  let product = null;
  if (productId && mongoose.isValidObjectId(productId)) {
    product = await Product.findById(productId);
  }
  if (!product && productId) {
    product = await Product.findOne({ sku: productId });
  }
  if (!product) {
    throw new CustomError('Truck part not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Check if linked to a verified delivered order
  let orderDoc = null;
  if (orderId && mongoose.isValidObjectId(orderId)) {
    orderDoc = await Order.findOne({ _id: orderId, user: userId }).lean();
  }
  if (!orderDoc) {
    orderDoc = await Order.findOne({
      user: userId,
      $or: [
        { 'items.product': product._id },
        { 'items.sku': product.sku }
      ],
      $or: [
        { orderStatus: 'Delivered' },
        { 'shipping.status': 'DELIVERED' }
      ]
    }).lean();
  }

  const isVerifiedPurchase = Boolean(orderDoc);
  const reviewerName = user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Verified Workshop';
  const reviewerRole = user.role === 'TRADE_CUSTOMER' ? 'Trade Account Fleet Buyer' : 'Verified Buyer';

  // Check if review already exists for this user and product
  let review = await Review.findOne({ user: userId, product: product._id });
  if (review) {
    review.rating = numericRating;
    review.title = title !== undefined ? title : review.title;
    review.comment = comment !== undefined ? comment : review.comment;
    review.truckModelReviewed = truckModelReviewed || review.truckModelReviewed;
    if (orderDoc) {
      review.order = orderDoc._id;
      review.orderNumber = orderDoc.orderNumber;
      review.isVerifiedPurchase = true;
    }
    review.isApproved = true;
    await review.save();
  } else {
    review = await Review.create({
      user: userId,
      product: product._id,
      order: orderDoc?._id,
      orderNumber: orderDoc?.orderNumber,
      rating: numericRating,
      title: title || '',
      comment: comment ? String(comment).trim() : '',
      truckModelReviewed: truckModelReviewed ? String(truckModelReviewed).trim() : '',
      reviewerName,
      reviewerRole,
      isVerifiedPurchase,
      isApproved: true
    });
  }

  // Recalculate genuine product aggregate stats
  const stats = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    product.rating = Math.round(stats[0].avgRating * 10) / 10;
    product.reviewCount = stats[0].count;
    await product.save();
  }

  reply.status(201).send({
    success: true,
    message: 'Thank you! Your rating and review has been published.',
    data: {
      review,
      product: {
        _id: product._id,
        sku: product.sku,
        rating: product.rating,
        reviewCount: product.reviewCount
      }
    }
  });
};

/**
 * Get approved reviews for a specific product by SKU or ObjectId.
 */
const getProductReviews = async (request, reply) => {
  const { productId } = request.params;

  let productFilter = null;
  if (mongoose.isValidObjectId(productId)) {
    productFilter = productId;
  } else {
    const found = await Product.findOne({ sku: productId }).select('_id').lean();
    if (found) productFilter = found._id;
  }

  if (!productFilter) {
    return reply.send({ success: true, count: 0, data: { reviews: [] } });
  }

  const reviews = await Review.find({ product: productFilter, isApproved: true })
    .populate('user', 'firstName lastName companyName role')
    .sort({ createdAt: -1 })
    .lean();

  const formattedReviews = reviews.map(r => ({
    _id: r._id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    truckModelReviewed: r.truckModelReviewed,
    reviewerName: r.reviewerName || (r.user?.companyName ? r.user.companyName : `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim()) || 'Verified Fleet Buyer',
    reviewerRole: r.reviewerRole || (r.user?.role === 'TRADE_CUSTOMER' ? 'Trade Account Fleet' : 'Verified Buyer'),
    isVerifiedPurchase: r.isVerifiedPurchase ?? true,
    createdAt: r.createdAt
  }));

  reply.send({ success: true, count: formattedReviews.length, data: { reviews: formattedReviews } });
};

/**
 * Get all reviews written by the authenticated user.
 */
const getMyReviews = async (request, reply) => {
  const userId = request.user._id;
  const reviews = await Review.find({ user: userId })
    .populate('product', 'name sku image pricing')
    .sort({ createdAt: -1 })
    .lean();

  reply.send({
    success: true,
    count: reviews.length,
    data: { reviews }
  });
};

/**
 * Get testimonials for homepage carousel ("Trusted at Counters Across the Country")
 */
const getTestimonials = async (request, reply) => {
  const testimonials = await Review.find({
    isFeaturedTestimonial: true,
    isApproved: true
  }).sort({ createdAt: -1 }).lean();

  const formatted = testimonials.map(t => ({
    id: t._id,
    name: t.reviewerName || 'Fleet Operator',
    role: t.reviewerRole || 'Workshop Lead',
    quote: t.comment || t.title || '',
    rating: t.rating || 5,
    truckModel: t.truckModelReviewed || ''
  }));

  reply.send({
    success: true,
    count: formatted.length,
    data: { testimonials: formatted }
  });
};

const adminGetReviews = async (request, reply) => {
  const reviews = await Review.find()
    .populate('user', 'firstName lastName email companyName role')
    .populate('product', 'name sku image pricing images')
    .sort({ createdAt: -1 })
    .lean();

  reply.send({ success: true, count: reviews.length, data: { reviews } });
};

const adminToggleReviewApproval = async (request, reply) => {
  const review = await Review.findById(request.params.id);
  if (!review) throw new CustomError('Review not found', 404, 'REVIEW_NOT_FOUND');

  review.isApproved = !review.isApproved;
  await review.save();

  // If review is linked to a product, recompute stats
  if (review.product) {
    const stats = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const cnt = stats.length > 0 ? stats[0].count : 0;
    await Product.findByIdAndUpdate(review.product, { rating: avg, reviewCount: cnt });
  }

  reply.send({
    success: true,
    message: `Review ${review.isApproved ? 'approved (visible)' : 'hidden (unapproved)'}`,
    data: { review }
  });
};

const adminToggleFeatured = async (request, reply) => {
  const review = await Review.findById(request.params.id);
  if (!review) throw new CustomError('Review not found', 404, 'REVIEW_NOT_FOUND');

  review.isFeaturedTestimonial = !review.isFeaturedTestimonial;
  await review.save();

  reply.send({
    success: true,
    message: `Review ${review.isFeaturedTestimonial ? 'featured on homepage carousel' : 'removed from homepage carousel'}`,
    data: { review }
  });
};

const adminDeleteReview = async (request, reply) => {
  const review = await Review.findById(request.params.id);
  if (!review) throw new CustomError('Review not found', 404, 'REVIEW_NOT_FOUND');
  const prodId = review.product;

  await Review.findByIdAndDelete(request.params.id);

  if (prodId) {
    const stats = await Review.aggregate([
      { $match: { product: prodId, isApproved: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const cnt = stats.length > 0 ? stats[0].count : 0;
    await Product.findByIdAndUpdate(prodId, { rating: avg, reviewCount: cnt });
  }

  reply.send({ success: true, message: 'Review deleted successfully' });
};

module.exports = {
  getPendingReviews,
  getMyReviews,
  createReview,
  getProductReviews,
  getTestimonials,
  adminGetReviews,
  adminToggleReviewApproval,
  adminToggleFeatured,
  adminDeleteReview
};

