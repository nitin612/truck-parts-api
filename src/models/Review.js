const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  comment: { type: String, trim: true },
  truckModelReviewed: String, // e.g., "Installed on 2018 Kenworth T909 Cummins X15"
  images: [{ url: String, publicId: String }],
  isApproved: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
