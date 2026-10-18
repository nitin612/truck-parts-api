/**
 * Applies 3% discount against Australian market competitor price
 * with standard rounding (e.g. 101.85 -> 102, 284.21 -> 284).
 * Sets both sellingPrice and mrp to the new clean price so there is
 * NO strikethrough, NO badge, just the clean lower price.
 * 
 * Strict protection: All 17 enquiry products (Tail Lifts and Honeycombs)
 * remain on POA with null price.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isEnquiry = (sku) => {
  return sku.startsWith('ATP-TL-') || (sku >= 'ATP-ACC-06' && sku <= 'ATP-ACC-16');
};

const calcNewPrice = (m) => {
  if (m >= 10) {
    const r = Math.round(m * 0.97);
    return r >= m ? m - 1 : r;
  }
  const r = Math.round(m * 0.97 * 10) / 10;
  return r >= m ? Math.round((m - 0.1) * 10) / 10 : r;
};

async function run() {
  const jsonPath = path.join(__dirname, '../db_products_162.json');
  const prods = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Loaded ${prods.length} products from ${jsonPath}`);

  let updatedCount = 0;
  const updates = [];

  for (const p of prods) {
    if (isEnquiry(p.sku)) {
      continue;
    }
    if (!p.pricing || p.pricing.isPOA || !p.pricing.sellingPrice) {
      continue;
    }

    const marketPrice = p.pricing.mrp || p.pricing.sellingPrice;
    const newPrice = calcNewPrice(marketPrice);

    p.pricing.sellingPrice = newPrice;
    p.pricing.mrp = newPrice;
    p.pricing.discountValue = 0;
    p.pricing.discountType = 'NONE';
    p.price = newPrice;

    updates.push({ sku: p.sku, marketPrice, newPrice });
    updatedCount++;
  }

  // Save back to db_products_162.json
  fs.writeFileSync(jsonPath, JSON.stringify(prods, null, 2), 'utf8');
  console.log(`Updated db_products_162.json with ${updatedCount} revised prices.`);

  // Update MongoDB Atlas
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from .env');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const productsColl = db.collection('products');

  let dbUpdated = 0;
  for (const u of updates) {
    const res = await productsColl.updateOne(
      { sku: u.sku },
      {
        $set: {
          'pricing.sellingPrice': u.newPrice,
          'pricing.mrp': u.newPrice,
          'pricing.discountValue': 0,
          'pricing.discountType': 'NONE',
          price: u.newPrice
        }
      }
    );
    if (res.modifiedCount > 0) dbUpdated++;
  }

  console.log(`Successfully updated ${dbUpdated} products in MongoDB Atlas.`);
  await mongoose.disconnect();
  console.log('Done!');
}

run().catch((err) => {
  console.error('Error applying 3% rounded prices:', err);
  process.exit(1);
});
