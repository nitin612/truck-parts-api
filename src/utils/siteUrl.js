// Canonical storefront origin for URLs the API publishes about the site (sitemap, IndexNow).
const SITE_URL = (process.env.SITE_URL || 'https://www.aurextruckparts.com.au').replace(/\/$/, '');

module.exports = { SITE_URL };
