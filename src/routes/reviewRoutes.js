const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

async function reviewRoutes(fastify, options) {
  fastify.get('/reviews/pending', { preHandler: authenticate }, reviewController.getPendingReviews);
  fastify.get('/reviews/mine', { preHandler: authenticate }, reviewController.getMyReviews);
  fastify.get('/reviews/testimonials', reviewController.getTestimonials);
  fastify.get('/products/:productId/reviews', reviewController.getProductReviews);
  fastify.post('/reviews', { preHandler: authenticate }, reviewController.createReview);
}

async function adminReviewRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, reviewController.adminGetReviews);
  fastify.patch('/:id/toggle-approval', { preHandler: adminAuth }, reviewController.adminToggleReviewApproval);
  fastify.patch('/:id/toggle-featured', { preHandler: adminAuth }, reviewController.adminToggleFeatured);
  fastify.delete('/:id', { preHandler: adminAuth }, reviewController.adminDeleteReview);
}

module.exports = {
  reviewRoutes,
  adminReviewRoutes
};
