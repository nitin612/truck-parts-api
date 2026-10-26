const { getSettings, updateSettings, resetSettings } = require('../controllers/settingController');
const { optionalAuth, authenticate, authorize, requireStaff } = require('../middleware/auth');

// Business, freight and bank details shown to customers: full admins only
const adminOnly = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];

async function settingRoutes(fastify, options) {
  fastify.get('/', getSettings);
  fastify.put('/', { preHandler: adminOnly }, updateSettings);
  fastify.post('/reset', { preHandler: adminOnly }, resetSettings);
}

async function adminSettingRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, getSettings);
  fastify.put('/', { preHandler: adminOnly }, updateSettings);
  fastify.post('/reset', { preHandler: adminOnly }, resetSettings);
}

module.exports = {
  settingRoutes,
  adminSettingRoutes
};
