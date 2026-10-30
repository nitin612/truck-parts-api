const Product = require('../models/Product');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
// The storefront proxies /sitemap.xml here, so every <loc> must be on the storefront's canonical host.
const { SITE_URL } = require('../utils/siteUrl');

// Indexable storefront pages that aren't backed by a catalogue document.
const STATIC_PATHS = ['/', '/shop', '/tail-lift-enquiry', '/about', '/contact', '/policies', '/track'];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const isoDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);

const latest = (...dates) => dates.filter(Boolean).reduce((a, b) => (new Date(a) > new Date(b) ? a : b), null);

const urlEntry = (path, lastmod) =>
  `  <url><loc>${escapeXml(SITE_URL + path)}</loc>${lastmod ? `<lastmod>${isoDate(lastmod)}</lastmod>` : ''}</url>`;

/**
 * Sitemap built from the live catalogue: only published parts, active categories and published posts,
 * so deleted or renumbered SKUs drop out on their own.
 */
const getSitemap = async (request, reply) => {
  const [products, categories, blogs] = await Promise.all([
    Product.find({ status: 'PUBLISHED' }).select('sku categorySlug updatedAt').sort({ sku: 1 }).lean(),
    Category.find({ isActive: true }).select('slug updatedAt').sort({ sortOrder: 1 }).lean(),
    Blog.find({ isPublished: true }).select('slug updatedAt').sort({ updatedAt: -1 }).lean()
  ]);

  // A category page changes whenever one of its parts does.
  const categoryUpdated = {};
  for (const p of products) {
    if (p.categorySlug) categoryUpdated[p.categorySlug] = latest(categoryUpdated[p.categorySlug], p.updatedAt);
  }
  const catalogueUpdated = latest(...products.map((p) => p.updatedAt));

  const entries = [
    ...STATIC_PATHS.map((path) => urlEntry(path, path === '/shop' ? catalogueUpdated : null)),
    ...categories
      .filter((c) => c.slug)
      .map((c) => urlEntry(`/shop/${encodeURIComponent(c.slug)}`, latest(c.updatedAt, categoryUpdated[c.slug]))),
    ...blogs.filter((b) => b.slug).map((b) => urlEntry(`/news/${encodeURIComponent(b.slug)}`, b.updatedAt)),
    ...products.filter((p) => p.sku).map((p) => urlEntry(`/product/${encodeURIComponent(p.sku)}`, p.updatedAt))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  reply
    .header('Content-Type', 'application/xml; charset=utf-8')
    // Admin edits show up within the hour without every crawler hit querying Mongo.
    .header('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
    .send(xml);
};

module.exports = { getSitemap };
