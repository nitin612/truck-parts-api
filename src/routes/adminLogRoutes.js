const adminLogController = require('../controllers/adminLogController');
const { authenticate, authorize } = require('../middleware/auth');

async function adminLogRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, adminLogController.adminGetLogs);
}

module.exports = adminLogRoutes;
