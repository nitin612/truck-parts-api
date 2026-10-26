const customerController = require('../controllers/customerController');
const { authenticate, authorize, requireStaff } = require('../middleware/auth');

// Trade discounts, credit and account removal: full admins only
const adminOnly = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];

async function customerRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, customerController.adminGetCustomers);
  fastify.get('/:id', { preHandler: [authenticate, requireStaff] }, customerController.adminGetCustomerDetail);
  fastify.patch('/:id/trade-status', { preHandler: adminOnly }, customerController.adminUpdateTradeStatus);
  fastify.patch('/:id/toggle-active', { preHandler: adminOnly }, customerController.adminToggleCustomerActive);
  fastify.delete('/:id', { preHandler: adminOnly }, customerController.adminDeleteCustomer);
}

module.exports = customerRoutes;
