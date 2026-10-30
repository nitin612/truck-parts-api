require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const TARGET_SKUS = [
  'ATP-TP-04',
  'ATP-TP-106',
  'ATP-ACC-02',
  'ATP-ACC-05',
  'ATP-TP-34',
  'ATP-ACC-04',
  'ATP-TP-20',
  'ATP-TP-71',
  'ATP-TP-96',
  'ATP-TP-87'
];

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing from environment!');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  const collection = db.collection('products');

  // 1. Before counts
  const beforeTotalBestSellers = await collection.countDocuments({ isBestSeller: true });
  console.log(`BEFORE countDocuments({ isBestSeller: true }): ${beforeTotalBestSellers}`);

  // 2. Inspect target SKUs
  const foundProducts = await collection.find({ sku: { $in: TARGET_SKUS } }).project({ sku: 1, name: 1, status: 1, isBestSeller: 1 }).toArray();
  console.log(`Found ${foundProducts.length} of ${TARGET_SKUS.length} target SKUs in database:`);
  for (const p of foundProducts) {
    console.log(`  - [${p.sku}] status="${p.status}", isBestSeller=${p.isBestSeller}, name="${p.name}"`);
  }

  if (foundProducts.length !== TARGET_SKUS.length) {
    const foundSkus = new Set(foundProducts.map(p => p.sku));
    const missing = TARGET_SKUS.filter(s => !foundSkus.has(s));
    console.warn(`WARNING: Missing SKUs: ${missing.join(', ')}`);
  }

  // 3. Perform updateMany
  console.log('\nExecuting updateMany on target SKUs with status "PUBLISHED"...');
  const updateResult = await collection.updateMany(
    { sku: { $in: TARGET_SKUS }, status: 'PUBLISHED' },
    { $set: { isBestSeller: true } }
  );

  console.log(`Update result: matchedCount=${updateResult.matchedCount}, modifiedCount=${updateResult.modifiedCount}`);

  // 4. After counts
  const afterTotalBestSellers = await collection.countDocuments({ isBestSeller: true });
  console.log(`\nAFTER countDocuments({ isBestSeller: true }): ${afterTotalBestSellers}`);

  const updatedProducts = await collection.find({ isBestSeller: true }).project({ sku: 1, name: 1, status: 1, isBestSeller: 1 }).toArray();
  console.log('\nCurrent Best Sellers in database:');
  for (const p of updatedProducts) {
    console.log(`  - [${p.sku}] status="${p.status}", isBestSeller=${p.isBestSeller}, name="${p.name}"`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Error during best sellers update:', err);
  process.exit(1);
});
