require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const SKUS_TO_SYNC = [
  { sku: 'ATP-TP-01', file: 'ATP-TP-01.jpg' },
  { sku: 'ATP-TP-02', file: 'ATP-TP-02.jpg' },
  { sku: 'ATP-TP-03', file: 'ATP-TP-03.jpg' },
  { sku: 'ATP-TP-14', file: 'ATP-TP-14-handle.jpg' },
  { sku: 'ATP-TP-16', file: 'ATP-TP-16.jpg' },
  { sku: 'ATP-TP-17', file: 'ATP-TP-17.jpg' },
  { sku: 'ATP-TP-20', file: 'ATP-TP-20.jpg' },
  { sku: 'ATP-TP-28', file: 'ATP-TP-28.jpg' },
  { sku: 'ATP-TP-43', file: 'ATP-TP-43.jpg' },
  // All 13 Body Panels
  { sku: 'ATP-BP-01', file: 'ATP-BP-01.jpg' },
  { sku: 'ATP-BP-02', file: 'ATP-BP-02.jpg' },
  { sku: 'ATP-BP-03', file: 'ATP-BP-03.jpg' },
  { sku: 'ATP-BP-04', file: 'ATP-BP-04.jpg' },
  { sku: 'ATP-BP-05', file: 'ATP-BP-05.jpg' },
  { sku: 'ATP-BP-06', file: 'ATP-BP-06.jpg' },
  { sku: 'ATP-BP-07', file: 'ATP-BP-07.jpg' },
  { sku: 'ATP-BP-08', file: 'ATP-BP-08.jpg' },
  { sku: 'ATP-BP-09', file: 'ATP-BP-09.jpg' },
  { sku: 'ATP-BP-10', file: 'ATP-BP-10.jpg' },
  { sku: 'ATP-BP-11', file: 'ATP-BP-11.jpg' },
  { sku: 'ATP-BP-12', file: 'ATP-BP-12.jpg' },
  { sku: 'ATP-BP-13', file: 'ATP-BP-13.jpg' },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const baseDir = path.resolve(__dirname, '../../public/images/products');

    for (const item of SKUS_TO_SYNC) {
      const filePath = path.join(baseDir, item.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      const publicId = `aurex_truck_parts/products/${item.sku}`;
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        invalidate: true
      });

      const secureUrl = uploadRes.secure_url;
      console.log(`Uploaded ${item.sku} -> ${secureUrl}`);

      // Update MongoDB Atlas
      await Product.updateOne(
        { sku: item.sku },
        {
          $set: {
            images: [
              {
                url: secureUrl,
                publicId: publicId,
                alt: item.sku,
                isPrimary: true,
                sortOrder: 0
              }
            ],
            imageUrl: secureUrl
          }
        }
      );
      console.log(`Updated Atlas DB for ${item.sku}`);
    }

    await mongoose.disconnect();
    console.log('Successfully synced all Cloudinary images and MongoDB Atlas products!');
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
})();
