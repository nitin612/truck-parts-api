const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function categoryRoutes(fastify, options) {
  fastify.get('/', categoryController.getCategories);
  fastify.get('/:slug', categoryController.getCategoryBySlug);
}

async function adminCategoryRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, categoryController.adminGetCategories);
  fastify.post('/', { preHandler: [...adminAuth, upload.single('image')] }, categoryController.adminCreateCategory);
  fastify.put('/:id', { preHandler: [...adminAuth, upload.single('image')] }, categoryController.adminUpdateCategory);
  fastify.delete('/:id', { preHandler: adminAuth }, categoryController.adminDeleteCategory);
}

module.exports = {
  categoryRoutes,
  adminCategoryRoutes
};
