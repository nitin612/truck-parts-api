const { getSettings, updateSettings, resetSettings } = require('../controllers/settingController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');

async function settingRoutes(fastify, options) {
  fastify.get('/', getSettings);
  fastify.put('/', { preHandler: [authenticate, requireStaff] }, updateSettings);
  fastify.post('/reset', { preHandler: [authenticate, requireStaff] }, resetSettings);
}

async function adminSettingRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, getSettings);
  fastify.put('/', { preHandler: [authenticate, requireStaff] }, updateSettings);
  fastify.post('/reset', { preHandler: [authenticate, requireStaff] }, resetSettings);
}

module.exports = {
  settingRoutes,
  adminSettingRoutes
};
