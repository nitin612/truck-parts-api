const mongoose = require('mongoose');

const homeSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  type: {
    type: String,
    enum: ['FEATURED_PRODUCTS', 'CATEGORY_GRID', 'BRAND_SHOWCASE', 'PROMO_BANNER', 'RECENT_ARRIVALS', 'HEAVY_ENGINE_SPECIALS'],
    required: true
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  brands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  customConfig: {
    bannerImage: String,
    bannerLink: String,
    layout: { type: String, default: 'grid' }
  },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomeSection', homeSectionSchema);
