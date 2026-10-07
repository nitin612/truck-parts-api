const brandController = require('../controllers/brandController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function brandRoutes(fastify, options) {
  fastify.get('/', brandController.getBrands);
  fastify.get('/:slug', brandController.getBrandBySlug);
}

async function adminBrandRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, brandController.adminGetBrands);
  fastify.post('/', { preHandler: [...adminAuth, upload.single('logo')] }, brandController.adminCreateBrand);
  fastify.put('/:id', { preHandler: [...adminAuth, upload.single('logo')] }, brandController.adminUpdateBrand);
  fastify.delete('/:id', { preHandler: adminAuth }, brandController.adminDeleteBrand);
}

module.exports = {
  brandRoutes,
  adminBrandRoutes
};
