/**
 * Resets every product's stored rating/reviewCount to what its approved reviews actually add up to.
 * Products seeded with placeholder scores (and no reviews) go back to 0 / 0, so the storefront shows no stars.
 *
 *   node scripts/recalc-product-ratings.cjs           dry run: prints what would change
 *   node scripts/recalc-product-ratings.cjs --apply   writes the changes
 *
 * Uses MONGO_URI from .env; override it on the command line to target another database.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Review = require('../src/models/Review');

const apply = process.argv.includes('--apply');

async function recalcRatings() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is missing from environment variables');
  }

  await mongoose.connect(uri);
  console.log(`🔗 Connected to ${mongoose.connection.host}/${mongoose.connection.name} (${apply ? 'APPLY' : 'dry run'})`);

  // Same aggregate the review endpoints use when a review is written, approved or deleted.
  const stats = await Review.aggregate([
    { $match: { product: { $ne: null }, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const byProduct = new Map(stats.map((s) => [String(s._id), s]));

  const products = await Product.find({}).select('sku rating reviewCount').lean();
  const updates = [];
  for (const p of products) {
    const s = byProduct.get(String(p._id));
    const rating = s ? Math.round(s.avgRating * 10) / 10 : 0;
    const reviewCount = s ? s.count : 0;
    if ((p.rating || 0) !== rating || (p.reviewCount || 0) !== reviewCount) {
      updates.push({ sku: p.sku, from: `${p.rating || 0}/${p.reviewCount || 0}`, to: `${rating}/${reviewCount}`, _id: p._id, rating, reviewCount });
    }
  }

  console.log(`${products.length} products, ${stats.length} with approved reviews, ${updates.length} out of step.`);
  for (const u of updates) console.log(`  ${u.sku}: ${u.from} -> ${u.to}`);

  // Product reviews with no customer account or order behind them were not written through the storefront.
  const unattributed = await Review.find({
    product: { $ne: null },
    isApproved: true,
    user: null,
    order: null
  }).populate('product', 'sku').select('reviewerName product').lean();
  if (unattributed.length) {
    console.log(`\n⚠️  ${unattributed.length} approved product review(s) have no customer or order (likely seeded). They still count above; hide or delete them in Admin > Reviews if they aren't genuine:`);
    for (const r of unattributed) console.log(`  ${r.product?.sku || r.product}: ${r.reviewerName || '(no name)'}`);
  }

  if (apply && updates.length) {
    const result = await Product.bulkWrite(
      updates.map((u) => ({
        updateOne: { filter: { _id: u._id }, update: { $set: { rating: u.rating, reviewCount: u.reviewCount } } }
      }))
    );
    console.log(`\n✅ Updated ${result.modifiedCount} products.`);
  } else if (updates.length) {
    console.log('\nDry run only. Re-run with --apply to write these changes.');
  }

  await mongoose.disconnect();
}

recalcRatings().catch(async (err) => {
  console.error('❌ Rating recalculation failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
