const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: String,
  bannerImage: {
    url: String,
    publicId: String
  },
  discountText: String,
  linkUrl: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
