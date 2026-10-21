const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Aurex Truck Parts Australia' },
  shortName: { type: String, default: 'Aurex' },
  legalName: { type: String, default: 'Aurex Panels Pty Limited' },
  phone: { type: String, default: '+61 414 730 467' },
  phoneHref: { type: String, default: 'tel:+61414730467' },
  email: { type: String, default: 'info@aurextruckparts.com.au' },
  address: { type: String, default: '77 Capital Link Drive, Campbellfield VIC 3061' },
  hours: { type: String, default: 'Mon to Fri 9am to 5pm. Sat 9am to 12pm.' },
  freeFreightOver: { type: Number, default: 200 },
  standardFee: { type: Number, default: 24 },
  expressFee: { type: Number, default: 39 },
  abn: { type: String, default: 'ABN 47 670 781 254' },
  acn: { type: String, default: '670 781 254' },
  announcement: { type: String, default: 'Free road freight over $200. Order by 2pm for same day dispatch.' },
  showAnnouncement: { type: Boolean, default: true },
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
