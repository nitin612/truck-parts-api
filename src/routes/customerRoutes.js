const customerController = require('../controllers/customerController');
const { authenticate, requireStaff } = require('../middleware/auth');

async function customerRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, customerController.adminGetCustomers);
  fastify.get('/:id', { preHandler: [authenticate, requireStaff] }, customerController.adminGetCustomerDetail);
  fastify.patch('/:id/trade-status', { preHandler: [authenticate, requireStaff] }, customerController.adminUpdateTradeStatus);
  fastify.patch('/:id/toggle-active', { preHandler: [authenticate, requireStaff] }, customerController.adminToggleCustomerActive);
  fastify.delete('/:id', { preHandler: [authenticate, requireStaff] }, customerController.adminDeleteCustomer);
}

module.exports = customerRoutes;
