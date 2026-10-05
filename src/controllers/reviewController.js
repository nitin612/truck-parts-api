const Review = require('../models/Review');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');

const getProductReviews = async (request, reply) => {
  const { productId } = request.params;
  const reviews = await Review.find({ product: productId, isApproved: true })
    .populate('user', 'firstName lastName companyName')
    .sort({ createdAt: -1 });

  reply.send({ success: true, count: reviews.length, data: { reviews } });
};

const createReview = async (request, reply) => {
  const { productId, rating, title, comment, truckModelReviewed } = request.body;
  const userId = request.user._id;

  const product = await Product.findById(productId);
  if (!product) throw new CustomError('Truck part not found', 404, 'PRODUCT_NOT_FOUND');

  const review = await Review.create({
    user: userId,
    product: productId,
    rating: Number(rating),
    title,
    comment,
    truckModelReviewed,
    isApproved: true // Auto-approved or set false if strict moderation
  });

  // Recalculate product rating
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
    message: 'Thank you! Your review has been posted.',
    data: { review }
  });
};

const adminGetReviews = async (request, reply) => {
  const reviews = await Review.find()
    .populate('user', 'firstName lastName email companyName')
    .populate('product', 'name sku')
    .sort({ createdAt: -1 });

  reply.send({ success: true, count: reviews.length, data: { reviews } });
};

const adminToggleReviewApproval = async (request, reply) => {
  const review = await Review.findById(request.params.id);
  if (!review) throw new CustomError('Review not found', 404, 'REVIEW_NOT_FOUND');

  review.isApproved = !review.isApproved;
  await review.save();

  reply.send({ success: true, message: `Review ${review.isApproved ? 'approved' : 'hidden'}`, data: { review } });
};

const adminDeleteReview = async (request, reply) => {
  const review = await Review.findByIdAndDelete(request.params.id);
  if (!review) throw new CustomError('Review not found', 404, 'REVIEW_NOT_FOUND');
  reply.send({ success: true, message: 'Review deleted successfully' });
};

module.exports = {
  getProductReviews,
  createReview,
  adminGetReviews,
  adminToggleReviewApproval,
  adminDeleteReview
};
