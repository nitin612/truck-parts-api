const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: ['TRUCK_MANUFACTURER', 'PARTS_MANUFACTURER', 'AFTERMARKET_BRAND'],
    default: 'PARTS_MANUFACTURER'
  },
  originCountry: String,
  website: String,
  logo: {
    url: String,
    publicId: String
  },
  description: String,
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

brandSchema.pre('save', function() {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Brand', brandSchema);
