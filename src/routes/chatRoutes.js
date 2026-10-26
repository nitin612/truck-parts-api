const chatController = require('../controllers/chatController');

async function chatRoutes(fastify, options) {
  fastify.post('/assistant', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, chatController.chatWithAssistant);
}

module.exports = chatRoutes;
