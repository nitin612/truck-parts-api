const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  action: {
    type: String,
    required: true // 'VIEW_PRODUCT', 'SEARCH_FITMENT', 'VIN_LOOKUP', 'ADD_TO_CART', 'SUBMIT_QUOTE', 'CHECKOUT'
  },
  metadata: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productSku: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    searchQuery: String,
    fitmentMake: String,
    fitmentModel: String,
    fitmentYear: Number,
    vinSearched: String
  }
}, {
  timestamps: true
});

userActivitySchema.index({ user: 1 });
userActivitySchema.index({ action: 1 });
userActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
