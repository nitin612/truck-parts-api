/**
 * Server-side order maths. The storefront computes a preview, but the
 * server NEVER trusts client totals — it recomputes subtotal, discount,
 * freight and grand total from the DB product prices, the settings and
 * the promo record. This is the anti-tampering guard.
 *
 * Shipping options mirror the storefront Checkout:
 *   - "Standard road"        : free over `freeFreightOver`, else `standardFee`
 *   - "Express priority"     : flat `expressFee`
 *   - "Click and Collect VIC": free
 */

export const SHIPPING_OPTIONS = ["Standard road", "Express priority", "Click and Collect VIC"];
export const PAYMENT_METHODS = ["Card", "Bank transfer", "Afterpay", "30 day fleet terms"];

export function shippingFeeFor(optionId, subtotal, settings) {
  const free = Number(settings?.freeFreightOver ?? 500);
  const std = Number(settings?.standardFee ?? 24);
  const exp = Number(settings?.expressFee ?? 39);
  switch (optionId) {
    case "Express priority":
      return exp;
    case "Click and Collect VIC":
      return 0;
    case "Standard road":
    default:
      return subtotal >= free ? 0 : std;
  }
}

/**
 * @param {Array<{sku,name,price,qty}>} pricedItems  items with trusted DB prices
 * @param {object|null} promo     active promo doc ({ code, pct }) or null
 * @param {string} shippingId
 * @param {object} settings
 * @returns {{ subtotal, discount, shippingFee, total, gst }}
 */
export function computeTotals(pricedItems, promo, shippingId, settings) {
  const subtotal = pricedItems.reduce((sum, l) => sum + Number(l.price) * Number(l.qty), 0);
  const discount = promo ? Math.round((subtotal * Number(promo.pct)) / 100) : 0;
  const shippingFee = shippingFeeFor(shippingId, subtotal, settings);
  const total = Math.max(0, subtotal - discount) + shippingFee;
  // AU prices are GST-inclusive; GST component = total / 11
  const gst = Math.round((total / 11) * 100) / 100;
  return { subtotal, discount, shippingFee, total, gst };
}

/** Human-friendly order reference, matching the storefront "AUX-####". */
export function makeOrderId() {
  return "AUX-" + Math.floor(1000 + Math.random() * 9000);
}
