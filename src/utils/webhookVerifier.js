const crypto = require('crypto');

/**
 * Timing-safe HMAC signature verifier for inbound webhooks (Stripe, GitHub, custom ERP).
 * Prevents timing attacks when comparing signatures.
 *
 * @param {string|Buffer} rawPayload - Raw request payload
 * @param {string} signatureHeader - Inbound signature header from request
 * @param {string} secret - Shared webhook signing secret
 * @param {string} [algorithm='sha256'] - Hashing algorithm
 * @returns {boolean} - True if signature is valid, false otherwise
 */
function verifyWebhookSignature(rawPayload, signatureHeader, secret, algorithm = 'sha256') {
  if (!rawPayload || !signatureHeader || !secret) {
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac(algorithm, secret)
      .update(typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload))
      .digest('hex');

    const cleanHeader = signatureHeader.replace(/^sha256=/, '').trim();
    const computedBuffer = Buffer.from(computedSignature, 'hex');
    const headerBuffer = Buffer.from(cleanHeader, 'hex');

    if (computedBuffer.length !== headerBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, headerBuffer);
  } catch (err) {
    return false;
  }
}

module.exports = {
  verifyWebhookSignature
};
