const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  summary: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  body: [{ type: mongoose.Schema.Types.Mixed }],
  coverImage: {
    url: String,
    publicId: String
  },
  img: String,
  date: String,
  tag: String,
  type: {
    type: String,
    enum: ['NEWS', 'GUIDE', 'ARTICLE'],
    default: 'NEWS'
  },
  author: {
    name: { type: String, default: 'Aurex Heavy Duty Tech Team' },
    avatar: String
  },
  tags: [String],
  category: {
    type: String,
    default: 'INDUSTRY_NEWS'
  },
  readTimeMinutes: { type: Number, default: 5 },
  isPublished: { type: Boolean, default: true },
  viewsCount: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

blogSchema.pre('save', function() {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.excerpt && !this.summary) this.summary = this.excerpt;
  if (this.summary && !this.excerpt) this.excerpt = this.summary;
  if (this.img && !this.coverImage?.url) {
    this.coverImage = { url: this.img, publicId: 'blog_' + (this.slug || Date.now()) };
  } else if (this.coverImage?.url && !this.img) {
    this.img = this.coverImage.url;
  }
  if (this.tag && (!this.tags || this.tags.length === 0)) {
    this.tags = [this.tag];
  }
});

blogSchema.index({ tags: 1 });
blogSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Blog', blogSchema);
