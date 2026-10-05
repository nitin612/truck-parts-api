const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: {
    type: String,
    enum: ['SALE', 'RESTOCK', 'RETURN_CORE', 'ADJUSTMENT', 'CANCELLED_ORDER', 'DAMAGED_WRITE_OFF'],
    required: true
  },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  referenceType: { type: String, enum: ['Order', 'ManualAdjustment', 'PurchaseOrderReceipt'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  notes: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
