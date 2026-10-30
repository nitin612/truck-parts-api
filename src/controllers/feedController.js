const Product = require('../models/Product');
const { SITE_URL } = require('../utils/siteUrl');
// The same public view the storefront gets: supplier codes stripped, house brand, no trade price.
const { normalizeProduct, toPublic } = require('./productController');

// Category names as the storefront shows them (src/data/seoContent.js CATEGORY_NAMES).
const CATEGORY_NAMES = { 'tail-lifts': 'Tail Lifts', 'trailer-parts': 'Trailer Parts', accessories: 'Accessories' };

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const availabilityOf = (stockStatus = '') => {
  if (/out of stock|sold out/i.test(stockStatus)) return 'out_of_stock';
  if (/order|back ?order/i.test(stockStatus)) return 'backorder';
  return 'in_stock';
};

const CONDITION = { NEW: 'new', AFTERMARKET_OEM_SPEC: 'new', REMAN_EXCHANGE: 'refurbished', USED_TESTED: 'used' };

const absolute = (url) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`);

/**
 * Google Merchant Center product feed (RSS 2.0 with the g: namespace), for free listings and Shopping.
 * Only published parts with a public price: price-on-application lines (tail lifts, panels) can't be listed.
 * Text, brand and prices are the storefront's public view (toPublic): supplier codes stripped, house brand,
 * GST-inclusive selling price. No GTINs are on file and supplier numbers stay private, so identifier_exists is "no".
 */
const getGoogleMerchantFeed = async (request, reply) => {
  const docs = await Product.find({ status: 'PUBLISHED' }).sort({ sku: 1 });

  const items = docs
    .map((doc) => ({ doc, p: toPublic(normalizeProduct(doc), doc) }))
    .filter(({ p }) => p.sku && !p.pricing?.isPOA && Number(p.pricing?.sellingPrice) > 0)
    .map(({ doc, p }) => {
      const firstImage = Array.isArray(p.images) && p.images[0] ? (p.images[0].url || p.images[0]) : p.imageUrl;
      const description = String(p.description || p.desc || p.shortDescription || p.name).replace(/\s+/g, ' ').trim().slice(0, 5000);
      const type = [CATEGORY_NAMES[doc.categorySlug] || doc.categorySlug, p.sub].filter(Boolean).join(' > ');
      return [
        '    <item>',
        `      <g:id>${escapeXml(p.sku)}</g:id>`,
        `      <g:title>${escapeXml(String(p.name).slice(0, 150))}</g:title>`,
        `      <g:description>${escapeXml(description)}</g:description>`,
        `      <g:link>${escapeXml(`${SITE_URL}/product/${encodeURIComponent(p.sku)}`)}</g:link>`,
        firstImage ? `      <g:image_link>${escapeXml(absolute(firstImage))}</g:image_link>` : null,
        `      <g:availability>${availabilityOf(p.stockStatus)}</g:availability>`,
        `      <g:price>${Number(p.pricing.sellingPrice).toFixed(2)} AUD</g:price>`,
        `      <g:brand>${escapeXml(p.brandName)}</g:brand>`,
        `      <g:condition>${CONDITION[doc.condition] || 'new'}</g:condition>`,
        '      <g:identifier_exists>no</g:identifier_exists>',
        type ? `      <g:product_type>${escapeXml(type)}</g:product_type>` : null,
        '    </item>',
      ].filter(Boolean).join('\n');
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Aurex Truck Parts Australia</title>
    <link>${SITE_URL}/</link>
    <description>Truck and trailer parts, tail lifts and body hardware from Campbellfield VIC.</description>
${items.join('\n')}
  </channel>
</rss>
`;

  reply
    .header('Content-Type', 'application/xml; charset=utf-8')
    .header('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
    .send(xml);
};

module.exports = { getGoogleMerchantFeed };
