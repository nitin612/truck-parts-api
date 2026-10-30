const JobState = require('../models/JobState');

/**
 * Rebuilds the storefront through a Vercel Deploy Hook when catalogue content changes, so its build-time HTML
 * snapshots (scripts/prerender.js in the storefront) stay current. Vercel cancels a hook build that is still
 * running when the same hook fires again, so a burst of edits ends in one finished build.
 *
 * Deploy hooks allow 60 triggers an hour, so triggers are spaced at least a minute apart. An edit that lands in
 * that gap is marked dirty and picked up by the daily cron (or the next edit). Off unless the hook URL is set:
 * set STOREFRONT_DEPLOY_HOOK_URL in the API's Production environment only.
 */
const STATE_ID = 'storefront-rebuild';
const MIN_GAP_MS = 60 * 1000;

const fireHook = async (log) => {
  try {
    const res = await fetch(process.env.STOREFRONT_DEPLOY_HOOK_URL, { method: 'POST', signal: AbortSignal.timeout(2500) });
    if (res.ok) log?.info('Storefront rebuild triggered');
    else log?.warn({ status: res.status }, 'Storefront deploy hook rejected the request');
    return res.ok;
  } catch (err) {
    log?.warn({ err: err.message }, 'Storefront deploy hook failed');
    return false;
  }
};

/**
 * Call after a change to public catalogue content. Awaited by callers (a serverless function can be frozen once
 * the response is sent); never throws, so an admin save can't fail because of it.
 */
const requestStorefrontRebuild = async (log) => {
  if (!process.env.STOREFRONT_DEPLOY_HOOK_URL) return;
  try {
    const now = new Date();
    await JobState.updateOne({ _id: STATE_ID }, { $set: { dirtyAt: now } }, { upsert: true });
    // Atomic claim, so concurrent saves fire the hook once.
    const claimed = await JobState.findOneAndUpdate(
      { _id: STATE_ID, $or: [{ lastTriggeredAt: null }, { lastTriggeredAt: { $lte: new Date(now.getTime() - MIN_GAP_MS) } }] },
      { $set: { lastTriggeredAt: now } }
    );
    if (claimed) await fireHook(log);
  } catch (err) {
    log?.warn({ err: err.message }, 'Storefront rebuild request failed');
  }
};

/** Daily cron: rebuild if something changed after the last trigger. */
const flushStorefrontRebuild = async (log) => {
  if (!process.env.STOREFRONT_DEPLOY_HOOK_URL) return { triggered: false, reason: 'STOREFRONT_DEPLOY_HOOK_URL not set' };
  const state = await JobState.findById(STATE_ID).lean();
  if (!state?.dirtyAt || (state.lastTriggeredAt && state.dirtyAt <= state.lastTriggeredAt)) {
    return { triggered: false, reason: 'storefront is up to date' };
  }
  await JobState.updateOne({ _id: STATE_ID }, { $set: { lastTriggeredAt: new Date() } });
  return { triggered: await fireHook(log) };
};

module.exports = { requestStorefrontRebuild, flushStorefrontRebuild };
