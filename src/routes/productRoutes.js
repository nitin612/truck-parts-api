const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function productRoutes(fastify, options) {
  fastify.get('/', productController.getProducts);
  fastify.get('/cross-reference', productController.crossReferenceLookup);
  fastify.get('/:identifier', productController.getProductBySkuOrSlug);
}

async function adminProductRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER')];
  fastify.get('/', { preHandler: adminAuth }, productController.adminGetProducts);
  fastify.post('/', { preHandler: [...adminAuth, upload.array('images', 8)] }, productController.adminCreateProduct);
  fastify.put('/:id', { preHandler: [...adminAuth, upload.array('images', 8)] }, productController.adminUpdateProduct);
  fastify.delete('/:id', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, productController.adminDeleteProduct);
}

module.exports = {
  productRoutes,
  adminProductRoutes
};
