const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true },
  comment: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

orderStatusHistorySchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
