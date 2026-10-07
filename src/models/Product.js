const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  alt: String,
  sortOrder: { type: Number, default: 0 },
  isPrimary: { type: Boolean, default: false }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, default: 'PDF' } // 'PDF', 'SCHEMATIC', 'MANUAL'
});

const badgeSchema = new mongoose.Schema({
  label: String,
  type: { type: String, default: 'info' } // 'success', 'warning', 'info', 'highlight'
});

const featureSchema = new mongoose.Schema({
  title: String,
  icon: String,
  value: String
});

const specificationSchema = new mongoose.Schema({
  label: String,
  value: String
});

const sectionSchema = new mongoose.Schema({
  title: String,
  content: String,
  isExpandedByDefault: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
});

const bulkTierSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  unitPrice: { type: Number, required: true }
});

const fitmentSchema = new mongoose.Schema({
  make: { type: String, required: true }, // e.g., 'Kenworth', 'Mack', 'Volvo', 'Freightliner', 'Scania', 'Isuzu'
  model: { type: String, required: true }, // e.g., 'T909', 'Super-Liner', 'FH16', 'Cascadia'
  yearFrom: Number,
  yearTo: Number,
  engine: String, // e.g., 'Cummins ISX15', 'Volvo D16', 'Detroit DD15'
  notes: String
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  
  // Truck Identification & Cross Reference
  oemPartNumber: { type: String, trim: true, index: true },
  alternatePartNumbers: [{ type: String, trim: true, uppercase: true }], // Cross-reference codes
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  brandName: { type: String, trim: true },
  
  condition: {
    type: String,
    enum: ['NEW', 'REMAN_EXCHANGE', 'AFTERMARKET_OEM_SPEC', 'USED_TESTED'],
    default: 'NEW'
  },

  placementPosition: {
    type: String,
    enum: [
      'FRONT_AXLE', 'REAR_AXLE', 'ENGINE_BAY', 'TRANSMISSION', 
      'DRIVELINE', 'SUSPENSION', 'BRAKE_SYSTEM', 'CABIN_BODY', 
      'EXHAUST_EMISSIONS', 'COOLING_SYSTEM', 'ELECTRICAL', 'UNIVERSAL'
    ],
    default: 'UNIVERSAL'
  },

  shortDescription: String,
  description: String,
  
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  
  fitments: [fitmentSchema],
  images: [imageSchema],
  documents: [documentSchema],
  
  pricing: {
    mrp: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    tradePrice: { type: Number, default: 0 }, // Special wholesale trade pricing
    isPOA: { type: Boolean, default: false }, // Price on Application (for heavy rebuilt engines/transmissions)
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED', 'NONE'], default: 'NONE' },
    discountValue: { type: Number, default: 0 }
  },

  bulkPricingTiers: [bulkTierSchema],

  coreDeposit: {
    required: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    returnWindowDays: { type: Number, default: 30 },
    notes: String
  },
  
  dimensions: {
    lengthCm: { type: Number, default: 0 },
    widthCm: { type: Number, default: 0 },
    heightCm: { type: Number, default: 0 },
    weightKg: { type: Number, default: 1.0 } // Critical for heavy freight
  },

  shippingClass: {
    type: String,
    enum: ['PARCEL', 'OVERSIZED_BULKY', 'PALLET_HEAVY', 'DANGEROUS_GOODS'],
    default: 'PARCEL'
  },

  inventory: {
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 3 },
    trackInventory: { type: Boolean, default: true },
    moq: { type: Number, default: 1 }, // Minimum order quantity
    warehouseLocation: String, // Shelf / Bin location for warehouse staff
    leadTimeDays: { type: Number, default: 1 }
  },
  
  badges: [badgeSchema],
  features: [featureSchema],
  specifications: [specificationSchema],
  sections: [sectionSchema],
  
  shippingInfo: {
    freeShippingEligible: { type: Boolean, default: false },
    estimatedDeliveryDays: { type: String, default: '1-3 Business Days' },
    heavyFreightOnly: { type: Boolean, default: false }
  },
  
  warranty: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: '12-Month Manufacturer Warranty' },
    description: String,
    durationMonths: { type: Number, default: 12 },
    kilometerLimit: { type: Number, default: 100000 }
  },
  
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  isFeatured: { type: Boolean, default: false },
  isNewProduct: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isBuyable: { type: Boolean, default: true },
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: String,
    canonicalUrl: String
  },
  
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

productSchema.pre('validate', function() {
  if (Array.isArray(this.categories) && this.categories.length > 0) {
    if (!this.category) {
      this.category = this.categories[0];
    }
  } else if (this.category) {
    this.categories = [this.category];
  }
});

productSchema.pre('save', function() {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(`${this.name}-${this.sku}`, { lower: true, strict: true });
  }

  // Calculate discount percentage if not explicitly set
  if (this.pricing && (this.isModified('pricing.sellingPrice') || this.isModified('pricing.mrp'))) {
    if (this.pricing.mrp > this.pricing.sellingPrice && this.pricing.mrp > 0) {
      this.pricing.discountType = 'PERCENTAGE';
      this.pricing.discountValue = Math.round(((this.pricing.mrp - this.pricing.sellingPrice) / this.pricing.mrp) * 100);
    } else {
      this.pricing.discountType = 'NONE';
      this.pricing.discountValue = 0;
    }
  }
});

// Indexes for high performance search and truck fitment queries
productSchema.index({ alternatePartNumbers: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'fitments.make': 1, 'fitments.model': 1 });
productSchema.index({ name: 'text', description: 'text', oemPartNumber: 'text', alternatePartNumbers: 'text' });

module.exports = mongoose.model('Product', productSchema);
