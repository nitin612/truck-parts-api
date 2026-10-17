const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Blog = require('../src/models/Blog');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const STATIC_IMAGES_DIR = path.resolve(__dirname, '../../Aurex-Trucks-Parts/public/images/web');

const BLOG_IMAGE_MAPPINGS = [
  {
    slug: 'tail-lifts-land-in-vic',
    fileName: 'aurex-tail-lift.webp',
    publicId: 'aurex-tail-lift'
  },
  {
    slug: 'toolbox-door-hardware-refresh',
    fileName: 'aurex-fleet-accessories.webp',
    publicId: 'aurex-fleet-accessories'
  },
  {
    slug: 'tracks-caps-fittings-explained',
    fileName: 'trailer-parts-category.webp',
    publicId: 'trailer-parts-category'
  },
  {
    slug: 'stainless-hinges-paddle-latches',
    fileName: 'aurex-trade-counter.webp',
    publicId: 'aurex-trade-counter'
  }
];

// Additional editorial images to upload to Cloudinary for fallback & editorial use
const ADDITIONAL_EDITORIAL_IMAGES = [
  { fileName: 'hero-trailer-parts-yellow.webp', publicId: 'hero-trailer-parts-yellow' },
  { fileName: 'aurex-trailer-parts.webp', publicId: 'aurex-trailer-parts' }
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  console.log('\n--- Uploading Blog Images to Cloudinary and Updating MongoDB ---');

  for (const item of BLOG_IMAGE_MAPPINGS) {
    const filePath = path.join(STATIC_IMAGES_DIR, item.fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    console.log(`\nUploading ${item.fileName} for blog slug [${item.slug}]...`);
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      folder: 'aurex_truck_parts/blogs',
      public_id: item.publicId,
      overwrite: true,
      resource_type: 'image'
    });

    console.log(`Uploaded to Cloudinary:`);
    console.log(`  Public ID: ${uploadRes.public_id}`);
    console.log(`  Secure URL: ${uploadRes.secure_url}`);

    // Update MongoDB
    const result = await Blog.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          coverImage: {
            url: uploadRes.secure_url,
            publicId: uploadRes.public_id
          },
          img: uploadRes.secure_url
        }
      },
      { new: true }
    );

    if (result) {
      console.log(`Updated Blog in MongoDB for slug [${item.slug}]:`);
      console.log(`  Title: ${result.title}`);
      console.log(`  CoverImage URL: ${result.coverImage?.url}`);
    } else {
      console.warn(`No blog found with slug [${item.slug}]`);
    }
  }

  console.log('\n--- Uploading Additional Editorial Images ---');
  for (const item of ADDITIONAL_EDITORIAL_IMAGES) {
    const filePath = path.join(STATIC_IMAGES_DIR, item.fileName);
    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${item.fileName}...`);
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'aurex_truck_parts/blogs',
        public_id: item.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      console.log(`  Uploaded ${res.public_id} -> ${res.secure_url}`);
    }
  }

  console.log('\n--- Verifying All Blogs in MongoDB ---');
  const allBlogs = await Blog.find({}).lean();
  allBlogs.forEach(b => {
    console.log({
      slug: b.slug,
      title: b.title,
      coverImage: b.coverImage,
      img: b.img
    });
  });

  await mongoose.disconnect();
  console.log('\nAll done successfully!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
