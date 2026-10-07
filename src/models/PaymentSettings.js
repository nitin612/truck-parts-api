const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  directBankTransfer: {
    enabled: { type: Boolean, default: true },
    bankName: { type: String, default: 'National Australia Bank (NAB)' },
    accountName: { type: String, default: 'Aurex Truck Parts Pty Ltd' },
    bsbOrRouting: { type: String, default: '083-004' },
    accountNumber: { type: String, default: '123456789' },
    swiftBic: { type: String, default: 'NATAAU3303M' },
    instructions: { type: String, default: 'Please include your Order Number as the payment reference. Stock is allocated once EFT remittance is received.' }
  },
  tradeAccount30Days: {
    enabled: { type: Boolean, default: true },
    description: { type: String, default: 'Approved 30-Day commercial trade credit account for registered transport companies and workshops.' },
    requireApproval: { type: Boolean, default: true }
  },
  codDepotPickup: {
    enabled: { type: Boolean, default: true },
    description: { type: String, default: 'Pay at main parts warehouse counter via EFTPOS or Cash during collection.' },
    warehouseAddress: { type: String, default: '100 Industrial Drive, Transport Logistics Hub, Sydney NSW 2000' }
  },
  purchaseOrders: {
    enabled: { type: Boolean, default: true },
    requirePONumber: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
