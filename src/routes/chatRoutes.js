const chatController = require('../controllers/chatController');

async function chatRoutes(fastify, options) {
  fastify.post('/assistant', chatController.chatWithAssistant);
}

module.exports = chatRoutes;
