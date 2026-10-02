import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import Promo from "../models/Promo.js";
import Setting from "../models/Setting.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { computeTotals, makeOrderId, SHIPPING_OPTIONS, PAYMENT_METHODS } from "../utils/pricing.js";
import sendEmail, { orderConfirmationEmail, orderStatusEmail } from "../services/email.js";

async function storeSettings() {
  return (await Setting.findOne({ key: "store" }).lean()) || {};
}

/**
 * POST /api/orders  (guest or authenticated)
 * The client sends only { items:[{sku,qty}], promoCode, shipping, payment, address }.
 * The server resolves prices from the DB, rejects POA/inactive lines,
 * validates the promo, recomputes every total, and persists the order.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, promoCode, shipping, payment, address } = req.body;

  if (!SHIPPING_OPTIONS.includes(shipping)) throw ApiError.badRequest("Invalid shipping option.");
  if (!PAYMENT_METHODS.includes(payment)) throw ApiError.badRequest("Invalid payment method.");

  // Resolve trusted prices from the DB
  const skus = items.map((i) => i.sku.toUpperCase());
  const products = await Product.find({ sku: { $in: skus }, active: true }).lean();
  const bySku = Object.fromEntries(products.map((p) => [p.sku, p]));

  const pricedItems = [];
  for (const line of items) {
    const p = bySku[line.sku.toUpperCase()];
    if (!p) throw ApiError.badRequest(`Product unavailable: ${line.sku}`);
    if (p.price === null || p.price === undefined) {
      throw ApiError.badRequest(`${p.name} is enquiry-only (POA) and cannot be bought online. Please raise an enquiry.`);
    }
    pricedItems.push({ sku: p.sku, name: p.name, price: p.price, qty: line.qty });
  }

  // Validate promo server-side
  let promo = null;
  if (promoCode) {
    promo = await Promo.findOne({ code: promoCode.toUpperCase(), active: true }).lean();
    if (!promo) throw ApiError.badRequest("That promo code is not active.");
  }

  const settings = await storeSettings();
  const { subtotal, discount, shippingFee, total, gst } = computeTotals(pricedItems, promo, shipping, settings);

  // Bank transfer / fleet terms / card-not-captured start unpaid & pending
  const paymentStatus = "unpaid";
  const status = payment === "Card" ? "Packed in Campbellfield VIC" : "Pending payment";

  // Generate a unique human ref
  let ref;
  for (let i = 0; i < 5; i++) {
    ref = makeOrderId();
    if (!(await Order.exists({ ref }))) break;
  }

  const order = await Order.create({
    ref,
    user: req.user?.id || null,
    email: address.email,
    items: pricedItems,
    subtotal,
    discount,
    promoCode: promo ? promo.code : null,
    shipping,
    shippingFee,
    payment,
    gst,
    total,
    address,
    status,
    paymentStatus,
    statusHistory: [{ status, note: "Order placed" }],
  });

  // Confirmation email (non-blocking; no-op if email isn't configured).
  sendEmail({ to: order.email, ...orderConfirmationEmail(order) }).catch(() => {});

  // For Card payment the storefront should next call POST /api/payments/create-intent
  // with this ref to collect payment via Stripe (when configured).
  res.status(201).json({ ok: true, order, needsPayment: order.payment === "Card" });
});

/** GET /api/orders/mine — authenticated customer's own orders. */
export const myOrders = asyncHandler(async (req, res) => {
  const items = await Order.find({ $or: [{ user: req.user.id }, { email: req.user.email }] })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ ok: true, items });
});

/**
 * GET /api/orders/track/:ref — public tracking by order reference.
 * Returns a limited public view (status + timeline), not full PII.
 */
export const trackOrder = asyncHandler(async (req, res) => {
  const ref = String(req.params.ref).toUpperCase();
  const order = await Order.findOne({ ref }).lean();
  if (!order) throw ApiError.notFound("No order found with that reference.");
  res.json({
    ok: true,
    order: {
      ref: order.ref,
      status: order.status,
      paymentStatus: order.paymentStatus,
      placedAt: order.placedAt,
      shipping: order.shipping,
      statusHistory: order.statusHistory,
      items: order.items.map((i) => ({ name: i.name, qty: i.qty })),
      total: order.total,
      suburb: order.address?.suburb,
      state: order.address?.state,
    },
  });
});

/* ---------------- Admin ---------------- */
export const listOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.ref = String(req.query.q).toUpperCase();
  const items = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, items });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ ref: String(req.params.ref).toUpperCase() }).lean();
  if (!order) throw ApiError.notFound("Order not found.");
  res.json({ ok: true, order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!ORDER_STATUSES.includes(status)) throw ApiError.badRequest("Invalid status.");
  const order = await Order.findOne({ ref: String(req.params.ref).toUpperCase() });
  if (!order) throw ApiError.notFound("Order not found.");
  order.status = status;
  if (status === "Delivered") order.paymentStatus = order.paymentStatus === "unpaid" ? order.paymentStatus : "paid";
  order.statusHistory.push({ status, note: note || "" });
  await order.save();
  // Notify the customer of the status change (non-blocking).
  sendEmail({ to: order.email, ...orderStatusEmail(order) }).catch(() => {});
  res.json({ ok: true, order });
});
