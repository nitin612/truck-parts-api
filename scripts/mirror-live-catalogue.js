/**
 * Local dev helper: mirror the PUBLIC catalogue of the deployed API into the
 * local MongoDB named in .env, so the storefront has real data to run against.
 *
 *   node scripts/mirror-live-catalogue.js
 *
 * Read-only against the live API (public GET endpoints only). Refuses to run
 * unless MONGO_URI points at localhost, so it can never overwrite Atlas.
 * Only catalogue/content collections are replaced; users, orders, enquiries
 * and admins in the local DB are left alone.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const LIVE = (process.env.MIRROR_SOURCE || 'https://truck-parts-api.vercel.app/api/v1').replace(/\/$/, '');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/truck_parts_db';

const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Brand = require('../src/models/Brand');
const CarouselSlide = require('../src/models/CarouselSlide');
const Blog = require('../src/models/Blog');
const SiteSetting = require('../src/models/SiteSetting');
const WelcomeOffer = require('../src/models/WelcomeOffer');
const PaymentSettings = require('../src/models/PaymentSettings');
const Coupon = require('../src/models/Coupon');
const Admin = require('../src/models/Admin');

const OID = /^[0-9a-fA-F]{24}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const REF_KEYS = new Set(['_id', 'category', 'subCategory', 'brand', 'parentCategory', 'product']);
const REF_ARRAY_KEYS = new Set(['categories']);
const VIRTUALS = new Set(['id', 'price', 'reviews', 'productCount', '__v']);

const toId = (v) => {
  if (v && typeof v === 'object' && v._id) v = v._id; // populated ref -> its id
  return typeof v === 'string' && OID.test(v) ? new mongoose.Types.ObjectId(v) : v;
};

// JSON from the API -> BSON-ready document (ids, dates, populated refs, virtuals).
function revive(value, key) {
  if (Array.isArray(value)) {
    return REF_ARRAY_KEYS.has(key) ? value.map(toId) : value.map((v) => revive(v));
  }
  if (value && typeof value === 'object') {
    if (key && REF_KEYS.has(key) && key !== '_id') return toId(value);
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (VIRTUALS.has(k)) continue;
      out[k] = REF_KEYS.has(k) ? toId(v) : revive(v, k);
    }
    return out;
  }
  if (typeof value === 'string' && ISO.test(value) && key && /(At|Date)$/.test(key)) return new Date(value);
  return value;
}

async function get(path) {
  const res = await fetch(LIVE + path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`);
  const json = await res.json();
  return json.data || json;
}

async function replace(Model, docs) {
  await Model.collection.deleteMany({});
  if (docs.length) await Model.collection.insertMany(docs.map((d) => revive(d)));
  console.log(`  ${Model.collection.collectionName.padEnd(16)} ${docs.length}`);
}

(async () => {
  const host = new URL(MONGO_URI.replace(/^mongodb(\+srv)?:/, 'http:')).hostname;
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
    throw new Error(`Refusing to mirror into non-local database host "${host}". Point MONGO_URI at localhost.`);
  }

  console.log(`Mirroring ${LIVE} -> ${MONGO_URI}`);
  const [products, categories, brands, slides, blogs, settings, offer, payments] = await Promise.all([
    get('/products?limit=2000').then((d) => d.products || []),
    get('/categories').then((d) => d.categories || []),
    get('/brands').then((d) => d.brands || []).catch(() => []),
    get('/carousel').then((d) => d.slides || []),
    get('/blogs?limit=200').then((d) => d.blogs || []),
    get('/settings').then((d) => d.settings),
    get('/welcome-offer').then((d) => d.offer).catch(() => null),
    get('/payments/config').catch(() => null),
  ]);

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await replace(Product, products);
  await replace(Category, categories);
  await replace(Brand, brands);
  await replace(CarouselSlide, slides);
  await replace(Blog, blogs);
  await replace(SiteSetting, settings ? [settings] : []);
  await replace(WelcomeOffer, offer ? [offer] : []);
  await replace(PaymentSettings, payments ? [payments] : []);

  // Coupons are not public. Recreate the welcome-offer code so promo checkout can be tested.
  if (offer?.couponCode && !(await Coupon.findOne({ code: offer.couponCode }))) {
    await Coupon.create({
      code: offer.couponCode,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minimumOrderValue: offer.minimumOrderValue || 0,
      startDate: new Date(Date.now() - 864e5),
      endDate: new Date(Date.now() + 365 * 864e5),
      isActive: true,
    });
    console.log(`  coupon           ${offer.couponCode} (local test copy)`);
  }

  // Local staff login, from this repo's .env (never the production admin).
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  if (adminEmail && process.env.ADMIN_PASSWORD && !(await Admin.findOne({ email: adminEmail }))) {
    await Admin.create({
      name: process.env.ADMIN_NAME || 'Local Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD,
      role: 'SUPER_ADMIN',
    });
    console.log(`  admin            ${adminEmail} (from .env)`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch(async (err) => {
  console.error('Mirror failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
