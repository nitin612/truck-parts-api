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
    make: String,
    model: String,
    year: Number
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
