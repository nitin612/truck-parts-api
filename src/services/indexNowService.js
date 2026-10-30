const { SITE_URL } = require('../utils/siteUrl');

/**
 * IndexNow tells Bing and the other IndexNow engines (Google doesn't take part) that storefront URLs changed,
 * so they re-crawl in minutes instead of days. Several AI assistants answer from Bing's index.
 * The key is public by design: the storefront serves it at /<key>.txt to prove we own the host.
 */
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '4530209e175d6a57f229efa52991edd3';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// Only the production API speaks for the live site: local and preview databases hold test edits.
const isEnabled = () =>
  process.env.INDEXNOW_ENABLED === 'true' ||
  (process.env.VERCEL_ENV === 'production' && process.env.INDEXNOW_ENABLED !== 'false');

/**
 * Storefront paths a product change affects, given its { sku, status, categorySlug } before and after
 * (null when it didn't exist). Every published state counts: the old URL may now be gone or unpublished,
 * the new one is fresh. Drafts were never public, so they have nothing indexed to refresh.
 */
const productChangePaths = (before, after) => {
  const paths = [];
  for (const state of [before, after]) {
    if (state?.status !== 'PUBLISHED') continue;
    if (state.sku) paths.push(`/product/${encodeURIComponent(state.sku)}`);
    if (state.categorySlug) paths.push(`/shop/${encodeURIComponent(state.categorySlug)}`);
  }
  return [...new Set(paths)];
};

/**
 * Submits the given storefront paths. Awaited by callers because a serverless function can be frozen once the
 * response is sent; the short timeout keeps a slow IndexNow from holding up an admin save. Never throws.
 */
const submitPaths = async (paths, log) => {
  if (!isEnabled() || !paths.length) return;
  const urlList = [...new Set(paths)].map((path) => SITE_URL + path);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, urlList }),
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) log?.info({ urls: urlList.length, status: res.status }, 'IndexNow submitted');
    else log?.warn({ status: res.status, urls: urlList }, 'IndexNow rejected submission');
  } catch (err) {
    log?.warn({ err: err.message }, 'IndexNow submission failed');
  }
};

const notifyProductChange = (before, after, log) => submitPaths(productChangePaths(before, after), log);

module.exports = { notifyProductChange, productChangePaths, submitPaths };
