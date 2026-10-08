const { getSettings, updateSettings } = require('../controllers/settingController');
const { authenticate, authorize } = require('../middleware/auth');

async function settingRoutes(fastify, options) {
  fastify.get('/', getSettings);
}

async function adminSettingRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, getSettings);
  fastify.put('/', { preHandler: adminAuth }, updateSettings);
}

module.exports = {
  settingRoutes,
  adminSettingRoutes
};
