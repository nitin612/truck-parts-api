const cmsController = require('../controllers/cmsController');
const { authenticate, authorize } = require('../middleware/auth');

async function cmsRoutes(fastify, options) {
  // Public Content Pages & Dynamic Home Sections
  fastify.get('/pages/:slug', cmsController.getPageBySlug);
  fastify.get('/home-sections', cmsController.getHomeSections);
}

async function adminCmsRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];

  // Content Pages
  fastify.get('/pages', { preHandler: adminAuth }, cmsController.adminGetPages);
  fastify.post('/pages', { preHandler: adminAuth }, cmsController.adminCreateOrUpdatePage);
  fastify.put('/pages/:id', { preHandler: adminAuth }, cmsController.adminCreateOrUpdatePage);
  fastify.delete('/pages/:id', { preHandler: adminAuth }, cmsController.adminDeletePage);

  // Home Sections
  fastify.get('/home-sections', { preHandler: adminAuth }, cmsController.adminGetHomeSections);
  fastify.post('/home-sections', { preHandler: adminAuth }, cmsController.adminCreateHomeSection);
  fastify.put('/home-sections/:id', { preHandler: adminAuth }, cmsController.adminUpdateHomeSection);
  fastify.delete('/home-sections/:id', { preHandler: adminAuth }, cmsController.adminDeleteHomeSection);
}

module.exports = {
  cmsRoutes,
  adminCmsRoutes
};
