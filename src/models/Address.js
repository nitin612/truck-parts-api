const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: { type: String, trim: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  suburbOrCity: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, default: 'Australia' },
  
  addressType: {
    type: String,
    enum: ['COMMERCIAL_WORKSHOP', 'FLEET_DEPOT', 'MINE_SITE', 'RESIDENTIAL', 'FREIGHT_DEPOT_COLLECT'],
    default: 'COMMERCIAL_WORKSHOP'
  },
  deliveryInstructions: { type: String, trim: true }, // e.g. "Forklift on site between 7am-4pm"
  hasForkliftOnSite: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
