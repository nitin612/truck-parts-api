/**
 * Authoritative Seeder & Synchronization Script for Aurex Truck Parts
 * 
 * Usage:
 *   node scripts/seed-clean-catalogue.cjs          # Smart sync (upsert + prune orphans, preserves IDs)
 *   node scripts/seed-clean-catalogue.cjs --fresh  # Wipe collection & fresh re-insert with backup
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isFreshMode = process.argv.includes('--fresh') || process.argv.includes('--wipe');

async function seed() {
  console.log('--- AUREX CANONICAL CATALOGUE SEEDER ---');
  console.log(`Mode: ${isFreshMode ? 'FRESH WIPE & RE-SEED' : 'IDEMPOTENT SYNC & PRUNE'}`);

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from environment variables.');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Atlas successfully.');

  const db = mongoose.connection.db;
  const productsColl = db.collection('products');

  // Load canonical catalog
  const catalogPath = path.join(__dirname, '../db_products_162.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Canonical catalog not found at ${catalogPath}`);
  }

  const rawProducts = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`Loaded ${rawProducts.length} canonical products from ${catalogPath}`);

  // Normalize image schema and clean fields
  const cleanProducts = rawProducts.map(p => {
    const sku = p.sku.toUpperCase();

    // Standardize images array to objects: { url, publicId, isPrimary, sortOrder }
    const rawImgs = Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []);
    const normalizedImages = rawImgs.map((img, idx) => {
      const url = typeof img === 'string' ? img : (img.url || img.imageUrl || '');
      return {
        url,
        publicId: (typeof img === 'object' && img.publicId) ? img.publicId : sku,
        isPrimary: idx === 0,
        sortOrder: idx
      };
    }).filter(img => Boolean(img.url));

    const primaryUrl = normalizedImages[0]?.url || `/images/products/${sku}.jpg`;
    if (normalizedImages.length === 0) {
      normalizedImages.push({
        url: primaryUrl,
        publicId: sku,
        isPrimary: true,
        sortOrder: 0
      });
    }

    return {
      ...p,
      sku,
      images: normalizedImages,
      imageUrl: primaryUrl,
      isPublished: true,
      isVisible: true,
      status: p.status || 'PUBLISHED'
    };
  });

  const canonicalSkus = cleanProducts.map(p => p.sku);
  console.log(`Canonical catalog contains ${canonicalSkus.length} unique SKUs.`);

  if (isFreshMode) {
    // 1. Backup current products
    const currentProducts = await productsColl.find({}).toArray();
    const backupPath = path.join(__dirname, `../backup_products_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(currentProducts, null, 2), 'utf8');
    console.log(`Backed up ${currentProducts.length} existing products to ${backupPath}`);

    // 2. Wipe
    console.log('Wiping existing products collection...');
    const delResult = await productsColl.deleteMany({});
    console.log(`Deleted ${delResult.deletedCount} existing documents.`);

    // 3. Re-insert
    console.log(`Inserting ${cleanProducts.length} canonical products...`);
    const insertDocs = cleanProducts.map(p => {
      const doc = { ...p };
      if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) {
        doc._id = new mongoose.Types.ObjectId(doc._id);
      } else {
        delete doc._id;
      }
      return doc;
    });

    const insResult = await productsColl.insertMany(insertDocs);
    console.log(`Successfully inserted ${insResult.insertedCount} products.`);
  } else {
    // Smart Idempotent Sync:
    // 1. Upsert each canonical product
    console.log(`Synchronizing ${cleanProducts.length} products...`);
    let updatedCount = 0;
    let insertedCount = 0;

    for (const prod of cleanProducts) {
      const updateDoc = { ...prod };
      delete updateDoc._id; // Never overwrite _id during update

      const res = await productsColl.updateOne(
        { sku: prod.sku },
        { $set: updateDoc },
        { upsert: true }
      );

      if (res.upsertedCount > 0) insertedCount++;
      else if (res.modifiedCount > 0) updatedCount++;
    }

    console.log(`Sync completed: ${updatedCount} modified, ${insertedCount} inserted, ${cleanProducts.length - updatedCount - insertedCount} unchanged.`);

    // 2. Prune any orphan/zombie SKUs not in canonical list
    const pruneResult = await productsColl.deleteMany({ sku: { $nin: canonicalSkus } });
    if (pruneResult.deletedCount > 0) {
      console.log(`Pruned ${pruneResult.deletedCount} orphan/outdated SKUs not in canonical list.`);
    } else {
      console.log('Zero orphan SKUs found. Database is 100% in sync with canonical catalog.');
    }
  }

  // Ensure unique index on sku
  try {
    await productsColl.createIndex({ sku: 1 }, { unique: true });
    console.log('Verified unique index on { sku: 1 }.');
  } catch (idxErr) {
    console.warn('Index notice:', idxErr.message);
  }

  const finalCount = await productsColl.countDocuments();
  console.log(`Final product count in MongoDB Atlas: ${finalCount}`);

  await mongoose.disconnect();
  console.log('--- SEED & SYNC COMPLETED SUCCESSFULLY ---');
}

seed().catch(err => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
