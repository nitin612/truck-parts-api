const mongoose = require('mongoose');
const slugify = require('slugify');

const contentPageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  summary: String,
  metaTitle: String,
  metaDescription: String,
  isPublished: { type: Boolean, default: true }
}, {
  timestamps: true
});

contentPageSchema.pre('save', function() {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('ContentPage', contentPageSchema);
