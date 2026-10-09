const categoryController = require('../controllers/categoryController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function categoryRoutes(fastify, options) {
  fastify.get('/', categoryController.getCategories);
  fastify.get('/:slug', categoryController.getCategoryBySlug);

  // Direct category mutations (staff only)
  fastify.post('/', { preHandler: [authenticate, requireStaff, upload.single('image')] }, categoryController.adminCreateCategory);
  fastify.put('/:id', { preHandler: [authenticate, requireStaff, upload.single('image')] }, categoryController.adminUpdateCategory);
  fastify.delete('/:id', { preHandler: [authenticate, requireStaff] }, categoryController.adminDeleteCategory);
}

async function adminCategoryRoutes(fastify, options) {
  const staffAuth = [authenticate, requireStaff];
  fastify.get('/', { preHandler: staffAuth }, categoryController.adminGetCategories);
  fastify.post('/', { preHandler: [...staffAuth, upload.single('image')] }, categoryController.adminCreateCategory);
  fastify.put('/:id', { preHandler: [...staffAuth, upload.single('image')] }, categoryController.adminUpdateCategory);
  fastify.delete('/:id', { preHandler: staffAuth }, categoryController.adminDeleteCategory);
}

module.exports = {
  categoryRoutes,
  adminCategoryRoutes
};
