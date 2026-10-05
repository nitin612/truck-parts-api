const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

async function paymentRoutes(fastify, options) {
  // Public config for available payment methods (Direct Wire, 30-Day Trade Account, COD)
  fastify.get('/config', paymentController.getPublicPaymentConfig);

  // Authenticated customer submit bank EFT reference / receipt proof
  fastify.post('/submit-proof', { preHandler: authenticate }, paymentController.submitPaymentProof);

  // Admin settings and manual payment confirmation
  fastify.get('/admin/settings', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, paymentController.adminGetPaymentSettings);
  fastify.put('/admin/settings', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, paymentController.adminUpdatePaymentSettings);
  fastify.patch('/admin/mark-paid/:orderId', { preHandler: [authenticate, authorize('SUPER_ADMIN', 'ADMIN')] }, paymentController.adminMarkOrderPaid);
}

module.exports = paymentRoutes;
