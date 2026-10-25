/**
 * Origin validation & dynamic app URL resolver.
 * Used for CORS, CSRF origin verification, and Stripe payment redirects.
 */

const rawOrigins = [
  process.env.CLIENT_ORIGINS,
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.APP_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
]
  .filter(Boolean)
  .flatMap((v) => (typeof v === 'string' ? v.split(',') : []))
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set(rawOrigins));

const isDev = process.env.NODE_ENV !== 'production';
const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isOriginAllowed(origin) {
  if (!origin) return true;
  const clean = origin.trim().replace(/\/$/, '');
  if (allowedOrigins.includes(clean)) return true;
  if (isDev && LOCAL_ORIGIN_REGEX.test(clean)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)?aurextruckparts\.com\.au$/.test(clean)) return true;
  if (/^https:\/\/truck-parts-[a-zA-Z0-9-]+\.vercel\.app$/.test(clean)) return true;
  return false;
}

/**
 * Resolves the storefront application URL dynamically from the request headers
 * (origin or referer), falling back to configured APP_URL or CLIENT_URL.
 * This guarantees Stripe redirects customers back to the exact domain they initiated checkout on.
 */
function resolveAppUrl(request) {
  const originHeader = request?.headers?.origin || request?.headers?.referer;
  if (originHeader) {
    try {
      const parsed = new URL(originHeader);
      if (isOriginAllowed(parsed.origin)) {
        return parsed.origin;
      }
    } catch (e) {
      // Fall through to configured URL
    }
  }

  const fallback = process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  return fallback.trim().replace(/\/$/, '');
}

module.exports = {
  allowedOrigins,
  isOriginAllowed,
  resolveAppUrl
};
