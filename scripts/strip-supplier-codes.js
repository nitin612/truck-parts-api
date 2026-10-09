/**
 * One-off catalogue clean-up: remove supplier / factory part numbers from the text
 * shoppers see (name, descriptions, image alt text, SEO fields), leaving Aurex
 * ATP- numbers as the only part numbers on the storefront.
 *
 *   node scripts/strip-supplier-codes.js            # dry run: prints what would change
 *   node scripts/strip-supplier-codes.js --apply    # writes the changes
 *
 * Nothing is thrown away: any code removed from a name is kept in the part's
 * `alternatePartNumbers`, which is staff-only and still searchable.
 * Runs against the MONGO_URI in .env. Take a backup before using --apply on production.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const { stripSupplierCodes, findSupplierCodes } = require('../src/utils/supplierCodes');

const APPLY = process.argv.includes('--apply');
const TEXT_FIELDS = ['name', 'shortDescription', 'description', 'desc'];
const SEO_FIELDS = ['metaTitle', 'metaDescription', 'keywords'];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  const { host, name } = mongoose.connection;
  console.log(`${APPLY ? 'APPLYING to' : 'Dry run on'} ${host}/${name}\n`);

  const products = await Product.find();
  let changed = 0;

  for (const product of products) {
    const own = [product.oem, product.oemPartNumber, ...(product.alternatePartNumbers || [])];
    const clean = (text) => stripSupplierCodes(text, own);
    const removed = new Set();
    const before = product.name;

    for (const field of TEXT_FIELDS) {
      const value = product[field];
      if (typeof value !== 'string' || !value) continue;
      const next = clean(value);
      if (next !== value) {
        findSupplierCodes(value).forEach((c) => removed.add(c));
        product[field] = next;
      }
    }
    for (const image of product.images || []) {
      if (image.alt && clean(image.alt) !== image.alt) image.alt = clean(image.alt);
    }
    for (const field of SEO_FIELDS) {
      const value = product.seo?.[field];
      if (typeof value === 'string' && value && clean(value) !== value) product.seo[field] = clean(value);
    }

    if (!product.isModified()) continue;
    changed += 1;

    const known = new Set((product.alternatePartNumbers || []).map((c) => c.toUpperCase()));
    for (const code of removed) {
      if (!known.has(code) && code !== String(product.oemPartNumber || '').toUpperCase()) {
        product.alternatePartNumbers.push(code);
      }
    }

    console.log(`${product.sku.padEnd(12)} ${before}\n${''.padEnd(10)}-> ${product.name}${removed.size ? `   [kept internally: ${[...removed].join(', ')}]` : ''}`);
    if (APPLY) await product.save();
  }

  console.log(`\n${changed} of ${products.length} parts ${APPLY ? 'updated' : 'would change'}.${APPLY ? '' : ' Re-run with --apply to write.'}`);
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Clean-up failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
