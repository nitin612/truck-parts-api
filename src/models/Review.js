const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: { type: String, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  comment: { type: String, trim: true },
  reviewerName: { type: String, trim: true },
  reviewerRole: { type: String, trim: true },
  truckModelReviewed: { type: String, trim: true }, // e.g., "Installed on 2018 Kenworth T909 Cummins X15"
  isVerifiedPurchase: { type: Boolean, default: false },
  isFeaturedTestimonial: { type: Boolean, default: false },
  images: [{ url: String, publicId: String }],
  isApproved: { type: Boolean, default: true }
}, {
  timestamps: true
});

reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ user: 1, product: 1 });
reviewSchema.index({ isFeaturedTestimonial: 1, isApproved: 1 });

module.exports = mongoose.model('Review', reviewSchema);
