const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrderValue: { type: Number, default: 0 },
  maximumDiscount: { type: Number },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  perUserLimit: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
