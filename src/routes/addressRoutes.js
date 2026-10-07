const addressController = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');

async function addressRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', addressController.getAddresses);
  fastify.post('/', addressController.createAddress);
  fastify.put('/:id', addressController.updateAddress);
  fastify.delete('/:id', addressController.deleteAddress);
}

module.exports = addressRoutes;
