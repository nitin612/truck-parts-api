const orderController = require('../controllers/orderController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');

const perMinute = (max) => ({ rateLimit: { max, timeWindow: '1 minute' } });

async function orderRoutes(fastify, options) {
  // Allow guest or authenticated checkout
  fastify.post('/', { config: perMinute(10), preHandler: optionalAuth }, orderController.createOrder);
  
  // My orders (auth or session)
  fastify.get('/mine', { preHandler: optionalAuth }, orderController.getMyOrders);
  
  // Public parcel tracking by order reference (PII-stripped safe tracking view)
  fastify.get('/track/:orderNumber', { config: perMinute(30) }, orderController.trackOrderByRef);
  
  // Orders list (staff only)
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, orderController.adminGetOrders);
  
  // Status update by reference (staff only)
  fastify.patch('/:orderNumber/status', { preHandler: [authenticate, requireStaff] }, orderController.updateOrderStatusByRef);

  // Single order lookup by orderNumber or ID (strictly verified: owner or matching guest email)
  fastify.get('/:orderNumber', { config: perMinute(30), preHandler: optionalAuth }, orderController.getOrderByNumber);
  fastify.get('/:orderNumber/invoice', { config: perMinute(30), preHandler: optionalAuth }, orderController.getOrderInvoice);
}

async function adminOrderRoutes(fastify, options) {
  const staffAuth = [authenticate, requireStaff];
  fastify.get('/', { preHandler: staffAuth }, orderController.adminGetOrders);
  fastify.get('/:id', { preHandler: staffAuth }, orderController.adminGetOrderDetail);
  fastify.get('/:id/invoice', { preHandler: staffAuth }, orderController.getOrderInvoice);
  fastify.patch('/:id/status', { preHandler: staffAuth }, orderController.updateOrderStatusByRef);
}

module.exports = {
  orderRoutes,
  adminOrderRoutes
};
