const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerSchema, loginSchema, validate } = require('../validators/authValidator');

async function authRoutes(fastify, options) {
  fastify.post('/register', { preValidation: validate(registerSchema) }, authController.register);
  fastify.post('/login', { preValidation: validate(loginSchema) }, authController.login);
  fastify.get('/me', { preHandler: authenticate }, authController.getMe);
  fastify.put('/profile', { preHandler: authenticate }, authController.updateProfile);
  fastify.post('/logout', authController.logout);
}

module.exports = authRoutes;
