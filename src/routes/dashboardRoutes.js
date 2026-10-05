const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

async function dashboardRoutes(fastify, options) {
  fastify.get('/stats', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER')] }, dashboardController.getDashboardStats);
}

module.exports = dashboardRoutes;
