const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: {
    url: String,
    publicId: String
  },
  author: {
    name: { type: String, default: 'Aurex Heavy Duty Tech Team' },
    avatar: String
  },
  tags: [String],
  category: {
    type: String,
    enum: ['MAINTENANCE_GUIDES', 'ENGINE_TECH', 'BRAKE_SYSTEMS', 'INDUSTRY_NEWS', 'FITMENT_ADVICE'],
    default: 'MAINTENANCE_GUIDES'
  },
  readTimeMinutes: { type: Number, default: 5 },
  isPublished: { type: Boolean, default: true },
  viewsCount: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

blogSchema.pre('save', function() {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

blogSchema.index({ tags: 1 });
blogSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Blog', blogSchema);
