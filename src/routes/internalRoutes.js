const crypto = require('crypto');
const { flushStorefrontRebuild } = require('../services/storefrontRebuildService');

// Vercel Cron calls these with "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set on the project.
const isCronRequest = (request) => {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.authorization || '';
  const expected = `Bearer ${secret}`;
  return Boolean(secret) && given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
};

async function internalRoutes(fastify, options) {
  fastify.get('/storefront-rebuild', async (request, reply) => {
    if (!isCronRequest(request)) return reply.code(401).send({ success: false, error: 'Unauthorized' });
    reply.send({ success: true, ...(await flushStorefrontRebuild(request.log)) });
  });
}

module.exports = internalRoutes;
