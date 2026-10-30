const sitemapController = require('../controllers/sitemapController');

async function sitemapRoutes(fastify, options) {
  fastify.get('/sitemap.xml', sitemapController.getSitemap);
}

module.exports = sitemapRoutes;
