const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerSchema, loginSchema, validate } = require('../validators/authValidator');

async function authRoutes(fastify, options) {
  fastify.post('/register', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    preValidation: validate(registerSchema)
  }, authController.register);
  fastify.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    preValidation: validate(loginSchema)
  }, authController.login);
  fastify.get('/me', { preHandler: authenticate }, authController.getMe);
  fastify.put('/profile', { preHandler: authenticate }, authController.updateProfile);
  fastify.post('/logout', authController.logout);
}

module.exports = authRoutes;
