const cartController = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

async function cartRoutes(fastify, options) {
  fastify.addHook('preHandler', optionalAuth);

  fastify.get('/', cartController.getCart);
  fastify.post('/items', cartController.addToCart);
  fastify.put('/items/:itemId', cartController.updateCartItem);
  fastify.delete('/items/:itemId', cartController.removeFromCart);
  fastify.delete('/clear', cartController.clearCart);
}

module.exports = cartRoutes;
