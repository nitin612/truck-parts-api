const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');

async function customerRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'SALES_REP')];
  fastify.get('/', { preHandler: adminAuth }, customerController.adminGetCustomers);
  fastify.get('/:id', { preHandler: adminAuth }, customerController.adminGetCustomerDetail);
  fastify.patch('/:id/trade-status', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, customerController.adminUpdateTradeStatus);
  fastify.patch('/:id/toggle-active', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, customerController.adminToggleCustomerActive);
}

module.exports = customerRoutes;
