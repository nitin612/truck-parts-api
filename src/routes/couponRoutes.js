const couponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

async function couponRoutes(fastify, options) {
  fastify.post('/validate', couponController.validateCoupon);
}

async function adminCouponRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, couponController.adminGetCoupons);
  fastify.post('/', { preHandler: adminAuth }, couponController.adminCreateCoupon);
  fastify.put('/:id', { preHandler: adminAuth }, couponController.adminUpdateCoupon);
  fastify.delete('/:id', { preHandler: adminAuth }, couponController.adminDeleteCoupon);
}

module.exports = {
  couponRoutes,
  adminCouponRoutes
};
