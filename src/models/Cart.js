const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceSnapshot: {
    type: Number,
    required: true
  },
  coreDepositSnapshot: {
    type: Number,
    default: 0
  },
  weightKgSnapshot: {
    type: Number,
    default: 1.0
  },
  selectedFitment: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    sparse: true,
    index: true
  },
  sessionId: {
    type: String,
    sparse: true,
    index: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  totalCoreDeposit: {
    type: Number,
    default: 0
  },
  totalWeightKg: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
