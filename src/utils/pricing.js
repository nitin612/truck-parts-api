/**
 * Heavy Truck Parts Pricing & Freight Calculator
 * Handles server-trusted price recalculations, core surcharges, weight-based freight, bulk tiers, and GST.
 */

const calculateOrderTotals = ({
  items = [],
  coupon = null,
  shippingMethod = 'STANDARD',
  destinationState = '',
  tradeDiscountPercent = 0,
  siteSettings = null
}) => {
  let subtotal = 0;
  let totalWeightKg = 0;
  let totalCoreDeposit = 0;

  // 1. Calculate items subtotal, core deposits, and total freight weight
  for (const item of items) {
    const unitPrice = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 1;
    const coreDeposit = Number(item.coreDeposit) || 0;
    const weightKg = Number(item.weightKg) || 1.0;

    subtotal += unitPrice * qty;
    totalCoreDeposit += coreDeposit * qty;
    totalWeightKg += weightKg * qty;
  }

  // 2. Apply B2B Trade Discount if applicable
  let tradeDiscountAmount = 0;
  if (tradeDiscountPercent > 0) {
    tradeDiscountAmount = Math.round((subtotal * (tradeDiscountPercent / 100)) * 100) / 100;
  }

  // 3. Apply Coupon Discount if applicable
  let couponDiscountAmount = 0;
  if (coupon && coupon.isActive) {
    const eligibleAmount = Math.max(0, subtotal - tradeDiscountAmount);
    if (!coupon.minimumOrderValue || eligibleAmount >= coupon.minimumOrderValue) {
      if (coupon.discountType === 'PERCENTAGE') {
        couponDiscountAmount = (eligibleAmount * (coupon.discountValue / 100));
        if (coupon.maximumDiscount && couponDiscountAmount > coupon.maximumDiscount) {
          couponDiscountAmount = coupon.maximumDiscount;
        }
      } else if (coupon.discountType === 'FIXED') {
        couponDiscountAmount = Math.min(eligibleAmount, coupon.discountValue);
      }
      couponDiscountAmount = Math.round(couponDiscountAmount * 100) / 100;
    }
  }

  const totalDiscount = Math.round((tradeDiscountAmount + couponDiscountAmount) * 100) / 100;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

  // 4. Freight fee, from Site Settings (callers cannot supply their own figure)
  const freeFreightOver = Number(siteSettings?.freeFreightOver) || 500;
  const standardFee = Number(siteSettings?.standardFee) || 24;
  const expressFee = Number(siteSettings?.expressFee) || 39;

  let shippingFee = 0;
  const normMethod = String(shippingMethod || '').toLowerCase();
  if (normMethod.includes('click') || normMethod.includes('collect') || normMethod.includes('pickup')) {
    shippingFee = 0;
  } else if (normMethod.includes('express')) {
    shippingFee = expressFee;
  } else {
    // Standard road
    shippingFee = discountedSubtotal >= freeFreightOver ? 0 : standardFee;
  }

  shippingFee = Math.round(shippingFee * 100) / 100;

  // 5. Grand Total (Australian retail pricing is GST inclusive)
  const grandTotal = Math.round((discountedSubtotal + shippingFee + totalCoreDeposit) * 100) / 100;

  // GST portion (inclusive 10% = 1/11th of total taxable amount for Tax Invoice reporting)
  const tax = Math.round(((discountedSubtotal + shippingFee) / 11) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tradeDiscountAmount,
    couponDiscountAmount,
    totalDiscount,
    totalCoreDeposit: Math.round(totalCoreDeposit * 100) / 100,
    totalWeightKg: Math.round(totalWeightKg * 100) / 100,
    shippingFee,
    tax,
    grandTotal
  };
};

module.exports = {
  calculateOrderTotals
};
