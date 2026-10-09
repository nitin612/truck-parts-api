const enquiryController = require('../controllers/enquiryController');
const { optionalAuth, authenticate, requireStaff } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

async function enquiryRoutes(fastify, options) {
  // Public or guest/auth submit quote request
  fastify.post('/', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    preHandler: [optionalAuth, upload.array('attachments', 4)]
  }, enquiryController.createEnquiry);
  
  fastify.get('/mine', { preHandler: optionalAuth }, enquiryController.getCustomerEnquiries);
  fastify.get('/lookup/:enquiryNumber', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    preHandler: optionalAuth
  }, enquiryController.getEnquiryByNumber);

  // List enquiries (staff only)
  fastify.get('/', { preHandler: [authenticate, requireStaff] }, enquiryController.adminGetEnquiries);

  // Update status by reference or id (staff only)
  fastify.patch('/:enquiryNumber/status', { preHandler: [authenticate, requireStaff] }, enquiryController.updateEnquiryStatusByRef);
}

async function adminEnquiryRoutes(fastify, options) {
  const staffAuth = [authenticate, requireStaff];
  fastify.get('/', { preHandler: staffAuth }, enquiryController.adminGetEnquiries);
  fastify.patch('/:id/respond', { preHandler: staffAuth }, enquiryController.adminRespondEnquiry);
  fastify.patch('/:enquiryNumber/status', { preHandler: staffAuth }, enquiryController.updateEnquiryStatusByRef);
}

module.exports = {
  enquiryRoutes,
  adminEnquiryRoutes
};
