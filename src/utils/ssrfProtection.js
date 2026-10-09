const urlModule = require('url');
const dns = require('dns').promises;

/**
 * SSRF (Server-Side Request Forgery) Protection Utility
 * Validates external URLs before server-side fetching or webhooks.
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^10\./,                          // RFC 1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC 1918 Class B
  /^192\.168\./,                    // RFC 1918 Class C
  /^169\.254\./,                    // Link-local / Cloud metadata (AWS/GCP/Azure)
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 unique local
  /^fe80:/i                         // IPv6 link-local
];

function isPrivateIp(ip) {
  if (!ip) return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

/**
 * Validate that a URL is safe for outbound server fetching (not pointing to internal network or cloud metadata).
 * @param {string} inputUrl - The URL to validate
 * @returns {Promise<{ safe: boolean, reason?: string, parsedUrl?: URL }>}
 */
async function validateSafeUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { safe: false, reason: 'URL must be a non-empty string' };
  }

  let parsed;
  try {
    parsed = new URL(inputUrl);
  } catch (err) {
    return { safe: false, reason: 'Malformed URL' };
  }

  // Only allow HTTP and HTTPS
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { safe: false, reason: `Unsupported protocol: ${parsed.protocol}. Only http: and https: are allowed.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost aliases
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]'
  ) {
    return { safe: false, reason: 'Loopback and localhost destinations are restricted' };
  }

  // Block direct IP literal matching private range
  if (isPrivateIp(hostname)) {
    return { safe: false, reason: 'Direct private IP addresses are restricted' };
  }

  // Resolve hostname via DNS to ensure it doesn't resolve to a private IP
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return { safe: false, reason: `Resolved IP ${record.address} belongs to a restricted internal network` };
      }
    }
  } catch (dnsErr) {
    return { safe: false, reason: `DNS lookup failed for hostname ${hostname}: ${dnsErr.message}` };
  }

  return { safe: true, parsedUrl: parsed };
}

module.exports = {
  validateSafeUrl,
  isPrivateIp
};
