const orderController = require('../controllers/orderController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');

async function orderRoutes(fastify, options) {
  // Allow guest or authenticated checkout
  fastify.post('/', { preHandler: optionalAuth }, orderController.createOrder);
  
  // My orders (auth or session)
  fastify.get('/mine', { preHandler: optionalAuth }, orderController.getMyOrders);
  
  // Public parcel tracking by order reference (PII-stripped safe tracking view)
  fastify.get('/track/:orderNumber', orderController.trackOrderByRef);
  
  // Orders list (staff only)
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, orderController.adminGetOrders);
  
  // Status update by reference (staff only)
  fastify.patch('/:orderNumber/status', { preHandler: [authenticate, requireStaff] }, orderController.updateOrderStatusByRef);

  // Single order lookup by orderNumber or ID (strictly verified: owner or matching guest email)
  fastify.get('/:orderNumber', { preHandler: optionalAuth }, orderController.getOrderByNumber);
}

async function adminOrderRoutes(fastify, options) {
  const staffAuth = [authenticate, requireStaff];
  fastify.get('/', { preHandler: staffAuth }, orderController.adminGetOrders);
  fastify.get('/:id', { preHandler: staffAuth }, orderController.adminGetOrderDetail);
  fastify.patch('/:id/status', { preHandler: staffAuth }, orderController.updateOrderStatusByRef);
}

module.exports = {
  orderRoutes,
  adminOrderRoutes
};
