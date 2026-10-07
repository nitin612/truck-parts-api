const welcomeOfferController = require('../controllers/welcomeOfferController');
const { authenticate, authorize } = require('../middleware/auth');

async function welcomeOfferRoutes(fastify, options) {
  fastify.get('/', welcomeOfferController.getWelcomeOffer);
}

async function adminWelcomeOfferRoutes(fastify, options) {
  fastify.put('/', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, welcomeOfferController.adminUpdateWelcomeOffer);
}

module.exports = {
  welcomeOfferRoutes,
  adminWelcomeOfferRoutes
};
