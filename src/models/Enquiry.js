const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enquiryNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: {
    type: String,
    required: true,
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
    required: true,
    trim: true
  },
  // Truck Vehicle Identification for precise part matching
  truckDetails: {
    vinOrChassis: { type: String, trim: true, uppercase: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: Number,
    engineSeries: String,
    transmissionType: String,
    differentialRatio: String
  },
  partDetails: {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    partName: String,
    oemPartNumber: String,
    quantity: { type: Number, default: 1 },
    urgency: {
      type: String,
      enum: ['TRUCK_OFF_ROAD_URGENT', 'STANDARD', 'STOCK_QUOTE'],
      default: 'STANDARD'
    }
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    url: String,
    publicId: String,
    title: String
  }],
  status: {
    type: String,
    enum: ['NEW', 'IN_REVIEW', 'QUOTE_SENT', 'RESOLVED', 'REJECTED'],
    default: 'NEW'
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
