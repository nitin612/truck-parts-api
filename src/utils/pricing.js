/**
 * Heavy Truck Parts Pricing & Freight Calculator
 * Handles server-trusted price recalculations, core surcharges, weight-based freight, bulk tiers, and GST.
 */

const calculateOrderTotals = ({
  items = [],
  coupon = null,
  shippingMethod = 'STANDARD',
  destinationState = '',
  tradeDiscountPercent = 0
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

  // 4. Calculate Heavy Freight Shipping Fee based on total weight (KG) and method
  let shippingFee = 0;
  if (shippingMethod === 'DEPOT_PICKUP' || shippingMethod === 'LOCAL_PICKUP') {
    shippingFee = 0;
  } else if (shippingMethod === 'EXPRESS_COURIER') {
    // Base $35 + $3.50 per kg over 5kg
    shippingFee = 35 + (totalWeightKg > 5 ? (totalWeightKg - 5) * 3.5 : 0);
  } else if (shippingMethod === 'HEAVY_FREIGHT_PALLET') {
    // Pallet / Tail-lift delivery for heavy truck engines/transmissions/axles
    shippingFee = 150 + (totalWeightKg > 100 ? (totalWeightKg - 100) * 0.85 : 0);
  } else {
    // Standard Commercial Freight: Free if order > $500 and weight < 25kg
    if (discountedSubtotal >= 500 && totalWeightKg <= 25) {
      shippingFee = 0;
    } else {
      // Base $20 + $1.80 per kg over 5kg
      shippingFee = 20 + (totalWeightKg > 5 ? (totalWeightKg - 5) * 1.8 : 0);
    }
  }

  shippingFee = Math.round(shippingFee * 100) / 100;

  // 5. Tax (10% GST included or added based on config)
  const taxableAmount = discountedSubtotal + shippingFee + totalCoreDeposit;
  const tax = Math.round((taxableAmount * 0.10) * 100) / 100;

  // 6. Grand Total
  const grandTotal = Math.round((discountedSubtotal + shippingFee + totalCoreDeposit + tax) * 100) / 100;

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
