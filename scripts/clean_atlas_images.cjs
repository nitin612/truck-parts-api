const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const CLEAN_MAPPINGS = [
  {
    sku: 'ATP-TP-01',
    images: [{ url: '/images/products/ATP-TP-01.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-01.jpg'
  },
  {
    sku: 'ATP-TP-02',
    images: [{ url: '/images/products/ATP-TP-02.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-02.jpg'
  },
  {
    sku: 'ATP-TP-03',
    images: [{ url: '/images/products/ATP-TP-03.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-03.jpg'
  },
  {
    sku: 'ATP-TP-14',
    images: [{ url: '/images/products/ATP-TP-14-handle.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-14-handle.jpg'
  },
  {
    sku: 'ATP-TP-16',
    images: [{ url: '/images/products/ATP-TP-16.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-16.jpg'
  },
  {
    sku: 'ATP-TP-17',
    images: [{ url: '/images/products/ATP-TP-17.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-17.jpg'
  },
  {
    sku: 'ATP-TP-20',
    images: [{ url: '/images/products/ATP-TP-20.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-20.jpg'
  },
  {
    sku: 'ATP-TP-28',
    images: [{ url: '/images/products/ATP-TP-28.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-28.jpg',
    name: 'Curtainsider Track Roller Assembly with Threaded Stem & Dual Lock Nuts',
    shortDescription: 'Heavy-duty dual-wheel curtainsider / tautliner track roller assembly engineered with smooth-gliding nylon wheels, zinc-plated steel bogie, and adjustable threaded bolt stem with dual lock nuts.'
  },
  {
    sku: 'ATP-TP-43',
    images: [{ url: '/images/products/ATP-TP-43.jpg', isPrimary: true }],
    imageUrl: '/images/products/ATP-TP-43.jpg',
    name: 'Rear Door Stainless Steel Hinge 260mm with Bolt Lug',
    shortDescription: 'Heavy-duty 260mm grade 304 polished stainless steel rear door hinge with bolt-on lug for commercial refrigerated and dry freight van bodies.'
  }
];

async function cleanImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  for (const m of CLEAN_MAPPINGS) {
    const update = { images: m.images, imageUrl: m.imageUrl };
    if (m.name) update.name = m.name;
    if (m.shortDescription) update.shortDescription = m.shortDescription;
    await Product.updateOne({ sku: m.sku }, { $set: update });
    console.log(`Cleaned DB images & details for ${m.sku}`);
  }
  await mongoose.disconnect();
  console.log('Finished cleaning MongoDB Atlas images.');
}
cleanImages().catch(console.error);
