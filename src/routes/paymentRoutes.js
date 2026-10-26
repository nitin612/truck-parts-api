const paymentController = require('../controllers/paymentController');
const { optionalAuth, authenticate, authorize, requireStaff } = require('../middleware/auth');

const perMinute = (max) => ({ rateLimit: { max, timeWindow: '1 minute' } });

async function paymentRoutes(fastify, options) {
  // Public config for available payment methods (Direct Wire, 30-Day Trade Account, COD, Stripe Card)
  fastify.get('/config', paymentController.getPublicPaymentConfig);

  // Stripe hosted checkout session creation & verification
  fastify.post('/create-checkout-session', { config: perMinute(10), preHandler: optionalAuth }, paymentController.createCheckoutSession);
  fastify.get('/verify-session', { config: perMinute(30), preHandler: optionalAuth }, paymentController.verifySession);
  fastify.post('/cancel-order', { config: perMinute(10), preHandler: optionalAuth }, paymentController.cancelOrderPayment);

  // Authenticated customer submit bank EFT reference / receipt proof
  fastify.post('/submit-proof', { config: perMinute(10), preHandler: optionalAuth }, paymentController.submitPaymentProof);

  // Inbound Stripe webhook with cryptographic signature verification (bypass rate-limit to avoid 429 on retry bursts)
  fastify.post('/webhook', { config: { rateLimit: false } }, paymentController.handleWebhook);

  // Admin settings and manual payment confirmation (staff only)
  fastify.get('/admin/settings', { preHandler: [authenticate, requireStaff] }, paymentController.adminGetPaymentSettings);
  fastify.put('/admin/settings', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, paymentController.adminUpdatePaymentSettings);
  fastify.patch('/admin/mark-paid/:orderId', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, paymentController.adminMarkOrderPaid);
}

module.exports = paymentRoutes;
