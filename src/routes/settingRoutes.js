const { getSettings, updateSettings } = require('../controllers/settingController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');

async function settingRoutes(fastify, options) {
  fastify.get('/', getSettings);
  fastify.put('/', { preHandler: [authenticate, requireStaff] }, updateSettings);
}

async function adminSettingRoutes(fastify, options) {
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, getSettings);
  fastify.put('/', { preHandler: [authenticate, requireStaff] }, updateSettings);
}

module.exports = {
  settingRoutes,
  adminSettingRoutes
};
