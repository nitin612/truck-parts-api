const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enquiryNumber: {
    type: String,
    required: true,
    unique: true
  },
  enquiryType: {
    type: String,
    enum: ['GENERAL', 'PART_QUOTE', 'TAIL_LIFT'],
    default: 'GENERAL',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: {
    type: String,
    default: 'Customer',
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  preferredContact: {
    type: String,
    trim: true
  },
  // Dedicated Tail Lift engineering specifications
  tailLiftDetails: {
    selectedModel: String,
    vehicleMakeModel: String,
    bodyType: String,
    voltage: String,
    bedHeight: String,
    bodyWidth: String,
    liftCapacity: String,
    platformMaterial: String,
    platformHeight: String,
    options: mongoose.Schema.Types.Mixed,
    serviceType: String,
    vinOrNotes: String
  },
  // Truck Vehicle Identification for precise part matching
  truckDetails: {
    vinOrChassis: { type: String, trim: true, uppercase: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    makeModel: { type: String, trim: true },
    bodyType: { type: String, trim: true },
    voltage: { type: String, trim: true },
    bedHeight: { type: String, trim: true },
    bodyWidth: { type: String, trim: true },
    year: Number,
    engineSeries: String,
    transmissionType: String,
    differentialRatio: String
  },
  partDetails: {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    partName: String,
    sku: String,
    oemPartNumber: String,
    capacity: String,
    material: String,
    platformHeight: String,
    serviceType: String,
    quantity: { type: Number, default: 1 },
    urgency: {
      type: String,
      default: 'STANDARD'
    }
  },
  message: {
    type: String,
    default: ''
  },
  attachments: [{
    url: String,
    publicId: String,
    title: String
  }],
  status: {
    type: String,
    default: 'New'
  },
  adminNotes: String,
  quotedPrice: Number,
  quotedAvailability: String,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  respondedAt: Date
}, {
  timestamps: true
});

enquirySchema.index({ email: 1 });
enquirySchema.index({ status: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
