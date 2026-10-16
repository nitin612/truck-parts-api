const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  directBankTransfer: {
    enabled: { type: Boolean, default: true },
    bankName: { type: String, default: 'NAB Australia Ltd' },
    accountName: { type: String, default: 'Aurex Panels Pty Limited' },
    bsbOrRouting: { type: String, default: '083-419' },
    accountNumber: { type: String, default: '90-287-1454' },
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
    warehouseAddress: { type: String, default: '77 Capital Link Drive, Campbellfield VIC 3061' }
  },
  purchaseOrders: {
    enabled: { type: Boolean, default: true },
    requirePONumber: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
