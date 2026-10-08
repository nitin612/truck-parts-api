const mongoose = require('mongoose');

const carouselSlideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  sub: { type: String, trim: true },
  eyebrow: { type: String, trim: true },
  cta: { type: String, default: 'Shop Now' },
  href: { type: String, default: '/shop' },
  buttonText: { type: String, default: 'Explore Products' },
  buttonLink: { type: String, default: '/shop' },
  enquiryHref: { type: String, default: '/tail-lift-enquiry' },
  enquiryLink: { type: String, default: '/tail-lift-enquiry' },
  img: String,
  image: {
    url: { type: String, default: '' },
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

carouselSlideSchema.pre('save', function() {
  if (this.sub && !this.subtitle) this.subtitle = this.sub;
  if (this.subtitle && !this.sub) this.sub = this.subtitle;
  if (this.eyebrow && !this.badgeText) this.badgeText = this.eyebrow;
  if (this.badgeText && !this.eyebrow) this.eyebrow = this.badgeText;
  if (this.cta && !this.buttonText) this.buttonText = this.cta;
  if (this.buttonText && !this.cta) this.cta = this.buttonText;
  if (this.href && !this.buttonLink) this.buttonLink = this.href;
  if (this.buttonLink && !this.href) this.href = this.buttonLink;
  if (this.img && !this.image?.url) {
    this.image = { url: this.img, publicId: 'slide_' + Date.now() };
  } else if (this.image?.url && !this.img) {
    this.img = this.image.url;
  }
});

module.exports = mongoose.model('CarouselSlide', carouselSlideSchema);
