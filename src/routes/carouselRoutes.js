const carouselController = require('../controllers/carouselController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function carouselRoutes(fastify, options) {
  fastify.get('/', carouselController.getSlides);
}

async function adminCarouselRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, carouselController.adminGetSlides);
  fastify.post('/', { preHandler: [...adminAuth, upload.single('image')] }, carouselController.adminCreateSlide);
  fastify.put('/:id', { preHandler: [...adminAuth, upload.single('image')] }, carouselController.adminUpdateSlide);
  fastify.delete('/:id', { preHandler: adminAuth }, carouselController.adminDeleteSlide);
}

module.exports = {
  carouselRoutes,
  adminCarouselRoutes
};
