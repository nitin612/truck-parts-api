const enquiryController = require('../controllers/enquiryController');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function enquiryRoutes(fastify, options) {
  // Public or guest/auth submit quote request
  fastify.post('/', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    preHandler: [optionalAuth, upload.array('attachments', 4)]
  }, enquiryController.createEnquiry);
  fastify.get('/mine', { preHandler: authenticate }, enquiryController.getCustomerEnquiries);
  fastify.get('/lookup/:enquiryNumber', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    preHandler: optionalAuth
  }, enquiryController.getEnquiryByNumber);
}

async function adminEnquiryRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'SALES_REP')];
  fastify.get('/', { preHandler: adminAuth }, enquiryController.adminGetEnquiries);
  fastify.patch('/:id/respond', { preHandler: adminAuth }, enquiryController.adminRespondEnquiry);
}

module.exports = {
  enquiryRoutes,
  adminEnquiryRoutes
};
