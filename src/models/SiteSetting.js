const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Aurex Truck Parts Australia' },
  shortName: { type: String, default: 'Aurex' },
  phone: { type: String, default: '03 9000 0000' },
  phoneHref: { type: String, default: 'tel:0390000000' },
  email: { type: String, default: 'sales@aurextruckparts.com.au' },
  address: { type: String, default: '41 Halley Court, Campbellfield VIC 3061' },
  hours: { type: String, default: 'Mon to Fri 9am to 5pm. Sat 9am to 12pm.' },
  freeFreightOver: { type: Number, default: 500 },
  standardFee: { type: Number, default: 24 },
  expressFee: { type: Number, default: 39 },
  abn: { type: String, default: 'ABN 12 345 678 901' },
  announcement: { type: String, default: 'Free road freight over $500. Order by 2pm for same day dispatch.' },
  promise: { type: String, default: 'Order by 2pm for same day dispatch from Campbellfield.' },
  faqs: [{
    q: String,
    a: String
  }],
  testimonials: [{
    name: String,
    role: String,
    quote: String,
    rating: { type: Number, default: 5 },
    sku: String,
    img: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
