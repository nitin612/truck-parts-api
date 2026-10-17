const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const prods = await Product.find({}).select('sku name category images imageUrl');
  console.log('Total prods in Atlas DB:', prods.length);
  const urlMap = {};
  for (const p of prods) {
    const u = (p.images && p.images[0] ? p.images[0].url : p.imageUrl) || '';
    if (!u) continue;
    if (!urlMap[u]) urlMap[u] = [];
    urlMap[u].push(p.sku + ' (' + p.name + ')');
  }
  console.log('--- Duplicate Image URLs across different products ---');
  let duplicateCount = 0;
  for (const [url, skus] of Object.entries(urlMap)) {
    if (skus.length > 1) {
      duplicateCount++;
      console.log(`[${duplicateCount}] URL: ${url}`);
      console.log('  Used by: ' + skus.join(' AND '));
    }
  }
  console.log(`Total duplicate image URLs found: ${duplicateCount}`);
  await mongoose.disconnect();
})();
