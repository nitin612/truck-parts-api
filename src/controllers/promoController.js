const Coupon = require('../models/Coupon');
const CustomError = require('../utils/CustomError');

const getPromos = async (request, reply) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  const items = coupons.map((c) => ({
    code: c.code,
    label: c.description || `${c.discountValue}% off`,
    pct: c.discountValue,
    active: !!c.isActive
  }));

  reply.send({
    success: true,
    count: items.length,
    items,
    data: { items }
  });
};

const getActivePromos = async (request, reply) => {
  const coupons = await Coupon.find({ isActive: true }).sort({ discountValue: -1 });
  const items = coupons.map((c) => ({
    code: c.code,
    label: c.description || `${c.discountValue}% off`,
    pct: c.discountValue,
    active: true
  }));

  reply.send({
    success: true,
    count: items.length,
    items,
    data: { items }
  });
};

const createPromo = async (request, reply) => {
  const { code, pct, label } = request.body || {};
  if (!code || !code.trim()) {
    throw new CustomError('Promo code is required', 400, 'CODE_REQUIRED');
  }

  const cleanCode = code.trim().toUpperCase();
  const n = Number(pct);
  if (!(n > 0 && n <= 90)) {
    throw new CustomError('Discount percentage must be between 1 and 90', 400, 'INVALID_PERCENT');
  }

  const coupon = await Coupon.findOneAndUpdate(
    { code: cleanCode },
    {
      code: cleanCode,
      description: label || `${n}% off`,
      discountType: 'PERCENTAGE',
      discountValue: n,
      startDate: new Date(Date.now() - 864e5),
      endDate: new Date(Date.now() + 365 * 864e5 * 5),
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const formatted = {
    code: coupon.code,
    label: coupon.description,
    pct: coupon.discountValue,
    active: coupon.isActive
  };

  reply.status(201).send({
    success: true,
    message: 'Promo code saved successfully',
    promo: formatted,
    data: { promo: formatted }
  });
};

const updatePromo = async (request, reply) => {
  const code = (request.params.code || '').trim().toUpperCase();
  const { active, pct, label } = request.body || {};

  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    throw new CustomError('Promo code not found', 404, 'PROMO_NOT_FOUND');
  }

  if (active !== undefined) coupon.isActive = Boolean(active);
  if (pct !== undefined) coupon.discountValue = Number(pct);
  if (label !== undefined) coupon.description = label;

  await coupon.save();

  const formatted = {
    code: coupon.code,
    label: coupon.description,
    pct: coupon.discountValue,
    active: coupon.isActive
  };

  reply.send({
    success: true,
    message: 'Promo code updated',
    promo: formatted,
    data: { promo: formatted }
  });
};

const deletePromo = async (request, reply) => {
  const code = (request.params.code || '').trim().toUpperCase();
  const deleted = await Coupon.findOneAndDelete({ code });
  if (!deleted) {
    throw new CustomError('Promo code not found', 404, 'PROMO_NOT_FOUND');
  }

  reply.send({
    success: true,
    message: `Promo code ${code} deleted successfully`
  });
};

module.exports = {
  getPromos,
  getActivePromos,
  createPromo,
  updatePromo,
  deletePromo
};
