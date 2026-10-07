const shippingController = require('../controllers/shippingController');

async function shippingRoutes(fastify, options) {
  fastify.get('/rates', shippingController.getShippingRates);
  fastify.get('/track/:carrier/:trackingNumber', shippingController.getTrackingInfo);
}

module.exports = shippingRoutes;
