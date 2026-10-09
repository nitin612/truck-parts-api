const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  oemPartNumber: String,
  brandName: String,
  image: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  coreDeposit: { type: Number, default: 0 },
  weightKg: { type: Number, default: 1.0 },
  total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  isGuest: { type: Boolean, default: false },
  guestEmail: { type: String, trim: true, lowercase: true },
  
  items: [orderItemSchema],
  
  shippingAddress: {
    companyName: String,
    fullName: String,
    phone: String,
    email: String,
    addressLine1: String,
    addressLine2: String,
    suburbOrCity: String,
    state: String,
    postalCode: String,
    country: String,
    deliveryInstructions: String,
    hasForkliftOnSite: Boolean
  },
  
  pricing: {
    subtotal: { type: Number, required: true },
    tradeDiscountAmount: { type: Number, default: 0 },
    couponDiscountAmount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalCoreDeposit: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    totalWeightKg: { type: Number, default: 0 }
  },
  
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  
  payment: {
    method: {
      type: String,
      default: 'CARD'
    },
    status: {
      type: String,
      enum: ['PENDING', 'AUTHORIZED', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING'
    },
    purchaseOrderNumber: String,
    bankTransferReference: String,
    paidAt: Date,
    paidAmount: { type: Number, default: 0 },
    paymentNotes: String
  },
  
  shipping: {
    carrier: { type: String, default: 'TOLL_EXPRESS_TNT' }, // e.g., Toll, TNT, Northline, Direct Freight
    trackingNumber: String,
    consignmentId: String,
    trackingUrl: String,
    shippingMethod: {
      type: String,
      default: 'Standard road'
    },
    status: {
      type: String,
      default: 'PROCESSING'
    },
    dispatchedAt: Date,
    estimatedDeliveryDate: Date,
    deliveredAt: Date
  },
  
  orderStatus: {
    type: String,
    default: 'Packed in Campbellfield VIC'
  },
  
  customerNotes: String,
  internalNotes: String
}, {
  timestamps: true
});

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
