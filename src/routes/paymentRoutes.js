const paymentController = require('../controllers/paymentController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');

async function paymentRoutes(fastify, options) {
  // Public config for available payment methods (Direct Wire, 30-Day Trade Account, COD, Stripe Card)
  fastify.get('/config', paymentController.getPublicPaymentConfig);

  // Stripe hosted checkout session creation & verification
  fastify.post('/create-checkout-session', { preHandler: optionalAuth }, paymentController.createCheckoutSession);
  fastify.get('/verify-session', { preHandler: optionalAuth }, paymentController.verifySession);
  fastify.post('/cancel-order', { preHandler: optionalAuth }, paymentController.cancelOrderPayment);

  // Authenticated customer submit bank EFT reference / receipt proof
  fastify.post('/submit-proof', { preHandler: optionalAuth }, paymentController.submitPaymentProof);

  // Inbound Stripe webhook with cryptographic signature verification (bypass rate-limit to avoid 429 on retry bursts)
  fastify.post('/webhook', { config: { rateLimit: false } }, paymentController.handleWebhook);

  // Admin settings and manual payment confirmation (staff only)
  fastify.get('/admin/settings', { preHandler: [authenticate, requireStaff] }, paymentController.adminGetPaymentSettings);
  fastify.put('/admin/settings', { preHandler: [authenticate, requireStaff] }, paymentController.adminUpdatePaymentSettings);
  fastify.patch('/admin/mark-paid/:orderId', { preHandler: [authenticate, requireStaff] }, paymentController.adminMarkOrderPaid);
}

module.exports = paymentRoutes;
