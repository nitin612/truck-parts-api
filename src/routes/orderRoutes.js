const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

async function orderRoutes(fastify, options) {
  fastify.post('/', { preHandler: authenticate }, orderController.createOrder);
  fastify.get('/mine', { preHandler: authenticate }, orderController.getMyOrders);
  fastify.get('/track/:orderNumber', orderController.trackOrderByRef);
  fastify.get('/:orderNumber', { preHandler: authenticate }, orderController.getOrderByNumber);
}

async function adminOrderRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER', 'SALES_REP')];
  fastify.get('/', { preHandler: adminAuth }, orderController.adminGetOrders);
  fastify.get('/:id', { preHandler: adminAuth }, orderController.adminGetOrderDetail);
  fastify.patch('/:id/status', { preHandler: adminAuth }, orderController.adminUpdateOrderStatus);
}

module.exports = {
  orderRoutes,
  adminOrderRoutes
};
