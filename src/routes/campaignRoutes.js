const campaignController = require('../controllers/campaignController');
const { authenticate, authorize } = require('../middleware/auth');

async function campaignRoutes(fastify, options) {
  fastify.get('/', campaignController.getActiveCampaigns);
}

async function adminCampaignRoutes(fastify, options) {
  const adminAuth = [authenticate, authorize('SUPER_ADMIN', 'ADMIN')];
  fastify.get('/', { preHandler: adminAuth }, campaignController.adminGetCampaigns);
  fastify.post('/', { preHandler: adminAuth }, campaignController.adminCreateCampaign);
  fastify.put('/:id', { preHandler: adminAuth }, campaignController.adminUpdateCampaign);
  fastify.delete('/:id', { preHandler: adminAuth }, campaignController.adminDeleteCampaign);
}

module.exports = {
  campaignRoutes,
  adminCampaignRoutes
};
