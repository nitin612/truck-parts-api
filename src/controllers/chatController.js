const { handleAssistantChat } = require('../services/aiChatService');
const CustomError = require('../utils/CustomError');

const chatWithAssistant = async (request, reply) => {
  const { message, history } = request.body;
  if (!message) throw new CustomError('Message is required', 400, 'MESSAGE_REQUIRED');

  const response = await handleAssistantChat(message, history || []);

  reply.send({
    success: true,
    data: response
  });
};

module.exports = {
  chatWithAssistant
};
