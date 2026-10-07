const Coupon = require('../models/Coupon');
const CustomError = require('../utils/CustomError');

const validateCoupon = async (request, reply) => {
  const { code, cartSubtotal = 0 } = request.body;
  if (!code) throw new CustomError('Coupon code is required', 400, 'CODE_REQUIRED');

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  if (!coupon) {
    throw new CustomError('Invalid or expired coupon code', 400, 'INVALID_COUPON');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new CustomError('This coupon usage limit has been reached', 400, 'COUPON_EXHAUSTED');
  }

  if (coupon.minimumOrderValue && cartSubtotal < coupon.minimumOrderValue) {
    throw new CustomError(`Coupon requires a minimum order subtotal of $${coupon.minimumOrderValue}`, 400, 'MIN_ORDER_UNMET');
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (cartSubtotal * (coupon.discountValue / 100));
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = Math.min(cartSubtotal, coupon.discountValue);
  }

  reply.send({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        discountAmount: Math.round(discount * 100) / 100
      }
    }
  });
};

const adminGetCoupons = async (request, reply) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  reply.send({ success: true, count: coupons.length, data: { coupons } });
};

const adminCreateCoupon = async (request, reply) => {
  const coupon = await Coupon.create(request.body);
  reply.status(201).send({ success: true, message: 'Coupon created successfully', data: { coupon } });
};

const adminUpdateCoupon = async (request, reply) => {
  const coupon = await Coupon.findByIdAndUpdate(request.params.id, request.body, { new: true });
  if (!coupon) throw new CustomError('Coupon not found', 404, 'COUPON_NOT_FOUND');
  reply.send({ success: true, message: 'Coupon updated successfully', data: { coupon } });
};

const adminDeleteCoupon = async (request, reply) => {
  const coupon = await Coupon.findByIdAndDelete(request.params.id);
  if (!coupon) throw new CustomError('Coupon not found', 404, 'COUPON_NOT_FOUND');
  reply.send({ success: true, message: 'Coupon deleted successfully' });
};

module.exports = {
  validateCoupon,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon
};
