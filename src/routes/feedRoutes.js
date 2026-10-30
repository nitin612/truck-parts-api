const feedController = require('../controllers/feedController');

async function feedRoutes(fastify, options) {
  fastify.get('/google-merchant.xml', feedController.getGoogleMerchantFeed);
}

module.exports = feedRoutes;
