const activityController = require('../controllers/activityController');
const { optionalAuth, authenticate, authorize } = require('../middleware/auth');

async function activityRoutes(fastify, options) {
  fastify.post('/track', { preHandler: optionalAuth }, activityController.trackActivity);
}

async function adminActivityRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, activityController.adminGetActivities);
}

module.exports = {
  activityRoutes,
  adminActivityRoutes
};
