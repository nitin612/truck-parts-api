const mongoose = require('mongoose');

const carouselSlideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/products' },
  image: {
    url: { type: String, required: true },
    publicId: String
  },
  mobileImage: {
    url: String,
    publicId: String
  },
  badgeText: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CarouselSlide', carouselSlideSchema);
