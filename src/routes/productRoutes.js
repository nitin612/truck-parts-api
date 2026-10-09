const productController = require('../controllers/productController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function productRoutes(fastify, options) {
  fastify.get('/', productController.getProducts);
  fastify.get('/cross-reference', productController.crossReferenceLookup);
  fastify.get('/:identifier', productController.getProductBySkuOrSlug);

  // Protected staff mutations
  fastify.post('/', { preHandler: [authenticate, requireStaff] }, productController.adminCreateProduct);
  fastify.put('/:identifier', { preHandler: [authenticate, requireStaff] }, productController.adminUpdateProduct);
  fastify.delete('/:identifier', { preHandler: [authenticate, requireStaff] }, productController.adminDeleteProduct);
}

async function adminProductRoutes(fastify, options) {
  const staffAuth = [authenticate, requireStaff];
  fastify.get('/', { preHandler: staffAuth }, productController.adminGetProducts);
  fastify.post('/', { preHandler: [...staffAuth, upload.array('images', 8)] }, productController.adminCreateProduct);
  fastify.put('/:id', { preHandler: [...staffAuth, upload.array('images', 8)] }, productController.adminUpdateProduct);
  fastify.delete('/:id', { preHandler: staffAuth }, productController.adminDeleteProduct);
}

module.exports = {
  productRoutes,
  adminProductRoutes
};
