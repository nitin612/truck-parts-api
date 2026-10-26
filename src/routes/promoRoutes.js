const promoController = require('../controllers/promoController');
const { authenticate, authorize, requireStaff } = require('../middleware/auth');

const adminOnly = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];

async function promoRoutes(fastify, options) {
  // Public active promos endpoint (for storefront banner and discount calculation)
  fastify.get('/active', promoController.getActivePromos);

  // All promos (admin and staff management)
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, promoController.getPromos);
  fastify.post('/', { preHandler: adminOnly }, promoController.createPromo);
  fastify.put('/:code', { preHandler: adminOnly }, promoController.updatePromo);
  fastify.delete('/:code', { preHandler: adminOnly }, promoController.deletePromo);
}

module.exports = promoRoutes;
