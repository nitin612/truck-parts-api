const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

async function wishlistRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', wishlistController.getWishlist);
  fastify.post('/toggle', wishlistController.toggleWishlistItem);
}

module.exports = wishlistRoutes;
