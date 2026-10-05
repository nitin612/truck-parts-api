const adminAuthController = require('../controllers/adminAuthController');
const { authenticate, authorize } = require('../middleware/auth');
const { adminLoginSchema, validate } = require('../validators/authValidator');

async function adminAuthRoutes(fastify, options) {
  fastify.post('/login', { preValidation: validate(adminLoginSchema) }, adminAuthController.login);
  fastify.get('/me', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER')] }, adminAuthController.getMe);
  fastify.post('/logout', adminAuthController.logout);
}

module.exports = adminAuthRoutes;
