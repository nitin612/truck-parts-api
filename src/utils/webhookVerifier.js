const crypto = require('crypto');

/**
 * Timing-safe HMAC signature verifier for inbound webhooks (Stripe, GitHub, custom ERP).
 * Supports both standard HMAC hex signatures and Stripe's timestamped header format (t=...,v1=...).
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
    const payloadString = typeof rawPayload === 'string' ? rawPayload : rawPayload.toString('utf8');

    // 1. Stripe timestamped header format: t=1492774577,v1=5257a869e7...
    if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
      const parts = signatureHeader.split(',');
      let timestamp = null;
      const signatures = [];

      for (const part of parts) {
        const [k, v] = part.trim().split('=');
        if (k === 't') timestamp = v;
        if (k === 'v1') signatures.push(v);
      }

      if (!timestamp || signatures.length === 0) {
        return false;
      }

      // Stripe tolerance check: 5 minutes (300 seconds)
      const now = Math.floor(Date.now() / 1000);
      const parsedTimestamp = parseInt(timestamp, 10);
      if (isNaN(parsedTimestamp) || Math.abs(now - parsedTimestamp) > 300) {
        return false;
      }

      const signedPayload = `${timestamp}.${payloadString}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      return signatures.some((sig) => {
        try {
          const sigBuffer = Buffer.from(sig, 'hex');
          return sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
        } catch {
          return false;
        }
      });
    }

    // 2. Standard HMAC (GitHub / Custom ERP): sha256=... or raw hex
    const cleanHeader = signatureHeader.replace(/^sha256=/, '').trim();
    const computedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payloadString, 'utf8')
      .digest('hex');

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
