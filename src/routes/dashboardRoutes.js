const dashboardController = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/auth');

async function dashboardRoutes(fastify, options) {
  fastify.get('/stats', { preHandler: optionalAuth }, dashboardController.getDashboardStats);
  fastify.get('/', { preHandler: optionalAuth }, dashboardController.getDashboardStats);
}

module.exports = dashboardRoutes;
