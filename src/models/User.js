const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'TRADE_CUSTOMER', 'FLEET_MANAGER'],
    default: 'CUSTOMER'
  },
  // B2B Trade & Fleet Fields
  companyName: {
    type: String,
    trim: true
  },
  abnOrTaxId: {
    type: String,
    trim: true
  },
  isTradeApproved: {
    type: Boolean,
    default: false
  },
  shippingAddress: {
    fullName: String,
    name: String,
    phone: String,
    email: String,
    companyName: String,
    addressLine1: String,
    addressLine2: String,
    streetAddress: String,
    address: String,
    suburbOrCity: String,
    suburb: String,
    state: String,
    postalCode: String,
    postcode: String,
    country: { type: String, default: 'Australia' },
    deliveryInstructions: String
  },
  tradeDiscountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  creditBalance: {
    type: Number,
    default: 0
  },
  fleetTruckModels: [{
    make: String,
    model: String,
    year: Number,
    vin: String,
    engine: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
