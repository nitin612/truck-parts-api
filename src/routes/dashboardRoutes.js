const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireStaff } = require('../middleware/auth');

async function dashboardRoutes(fastify, options) {
  const staffAuth = [authenticate, requireStaff];
  fastify.get('/stats', { preHandler: staffAuth }, dashboardController.getDashboardStats);
  fastify.get('/', { preHandler: staffAuth }, dashboardController.getDashboardStats);
}

module.exports = dashboardRoutes;
