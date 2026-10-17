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
  }
];

async function cleanImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  for (const m of CLEAN_MAPPINGS) {
    await Product.updateOne({ sku: m.sku }, { $set: { images: m.images, imageUrl: m.imageUrl } });
    console.log(`Cleaned DB images for ${m.sku}`);
  }
  await mongoose.disconnect();
  console.log('Finished cleaning MongoDB Atlas images.');
}
cleanImages().catch(console.error);
