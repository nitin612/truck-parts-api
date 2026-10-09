const upload = require('../middleware/uploadMiddleware');
const { authenticate, requireStaff } = require('../middleware/auth');
const { uploadImage } = require('../services/cloudinaryService');
const fs = require('fs');

async function uploadRoutes(fastify, options) {
  fastify.post('/', {
    preHandler: [authenticate, requireStaff, upload.single('image')]
  }, async (request, reply) => {
    if (!request.file) {
      return reply.status(400).send({
        success: false,
        error: 'No image file provided'
      });
    }

    try {
      const result = await uploadImage(request.file.path, 'truck-parts/uploads');
      // If uploaded to Cloudinary (http URL), unlink temp file; if local fallback, keep file for static serving
      if (result.url && result.url.startsWith('http')) {
        try { fs.unlinkSync(request.file.path); } catch (e) {}
      }

      reply.send({
        success: true,
        url: result.url,
        path: result.url,
        filename: request.file.originalname
      });
    } catch (err) {
      reply.status(500).send({
        success: false,
        error: err.message
      });
    }
  });
}

module.exports = uploadRoutes;
