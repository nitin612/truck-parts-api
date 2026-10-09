const promoController = require('../controllers/promoController');
const { authenticate, requireStaff } = require('../middleware/auth');

async function promoRoutes(fastify, options) {
  // Public active promos endpoint (for storefront banner and discount calculation)
  fastify.get('/active', promoController.getActivePromos);

  // All promos (admin and staff management)
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, promoController.getPromos);
  fastify.post('/', { preHandler: [authenticate, requireStaff] }, promoController.createPromo);
  fastify.put('/:code', { preHandler: [authenticate, requireStaff] }, promoController.updatePromo);
  fastify.delete('/:code', { preHandler: [authenticate, requireStaff] }, promoController.deletePromo);
}

module.exports = promoRoutes;
