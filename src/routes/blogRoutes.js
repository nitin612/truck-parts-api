const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function blogRoutes(fastify, options) {
  fastify.get('/', blogController.getBlogs);
  fastify.get('/:slug', blogController.getBlogBySlug);
}

async function adminBlogRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, blogController.adminGetBlogs);
  fastify.post('/', { preHandler: [...adminAuth, upload.single('coverImage')] }, blogController.adminCreateBlog);
  fastify.put('/:id', { preHandler: [...adminAuth, upload.single('coverImage')] }, blogController.adminUpdateBlog);
  fastify.delete('/:id', { preHandler: adminAuth }, blogController.adminDeleteBlog);
}

module.exports = {
  blogRoutes,
  adminBlogRoutes
};
