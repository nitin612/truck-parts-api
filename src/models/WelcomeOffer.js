const mongoose = require('mongoose');

const welcomeOfferSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Welcome Trade Discount' },
  description: { type: String, default: 'Get $50 off your first commercial truck parts order over $500.' },
  couponCode: { type: String, required: true, uppercase: true, default: 'WELCOME50' },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'FIXED' },
  discountValue: { type: Number, default: 50 },
  minimumOrderValue: { type: Number, default: 500 },
  bannerImage: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('WelcomeOffer', welcomeOfferSchema);
