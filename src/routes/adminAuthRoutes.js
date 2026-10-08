const adminAuthController = require('../controllers/adminAuthController');
const { authenticate, authorize } = require('../middleware/auth');
const { adminLoginSchema, validate } = require('../validators/authValidator');

async function adminAuthRoutes(fastify, options) {
  fastify.post('/login', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    preValidation: validate(adminLoginSchema)
  }, adminAuthController.login);
  fastify.get('/me', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER')] }, adminAuthController.getMe);
  fastify.post('/2fa/setup', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, adminAuthController.setup2FA);
  fastify.post('/2fa/verify', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, adminAuthController.verifyAndEnable2FA);
  fastify.post('/2fa/disable', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, adminAuthController.disable2FA);
  fastify.post('/logout', adminAuthController.logout);
}

module.exports = adminAuthRoutes;
