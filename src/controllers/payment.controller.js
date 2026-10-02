import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createPaymentIntent, createCheckoutSession as stripeCheckoutSession, constructEvent, stripeEnabled } from "../services/stripe.js";
import sendEmail, { orderStatusEmail } from "../services/email.js";

/**
 * POST /api/payments/create-intent  { ref }
 * Returns a Stripe client secret the storefront uses to confirm the card /
 * Afterpay payment for an existing order.
 */
export const createIntent = asyncHandler(async (req, res) => {
  if (!stripeEnabled()) throw ApiError.badRequest("Online card payments are not enabled yet.");
  const ref = String(req.body.ref || "").toUpperCase();
  const order = await Order.findOne({ ref });
  if (!order) throw ApiError.notFound("Order not found.");
  if (order.paymentStatus === "paid") throw ApiError.badRequest("This order is already paid.");

  const intent = await createPaymentIntent(order);
  res.json({ ok: true, clientSecret: intent.client_secret, amount: order.total, ref: order.ref });
});

/**
 * POST /api/payments/create-checkout-session  { ref }
 * Returns a hosted Stripe Checkout URL for an existing order.
 */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  if (!stripeEnabled()) throw ApiError.badRequest("Online card payments are not enabled yet.");
  const ref = String(req.body.ref || "").toUpperCase();
  const order = await Order.findOne({ ref });
  if (!order) throw ApiError.notFound("Order not found.");
  if (order.paymentStatus === "paid") throw ApiError.badRequest("This order is already paid.");
  const session = await stripeCheckoutSession(order);
  res.json({ ok: true, url: session.url, ref: order.ref });
});

/**
 * POST /api/payments/webhook  (Stripe → us)
 * Mounted with a RAW body parser in app.js. Verifies the signature and, on a
 * successful payment, marks the matching order paid + ready to pack.
 */
export const webhook = asyncHandler(async (req, res) => {
  if (!stripeEnabled()) return res.json({ received: true, skipped: true });
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = await constructEvent(req.body, signature); // req.body is a Buffer here
  } catch (err) {
    return res.status(400).json({ ok: false, error: `Webhook signature failed: ${err.message}` });
  }

  // Both the hosted Checkout and a direct PaymentIntent confirm this way.
  if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
    const ref = event.data.object?.metadata?.orderRef;
    if (ref) {
      const order = await Order.findOne({ ref });
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        if (order.status === "Pending payment") order.status = "Packed in Campbellfield VIC";
        order.statusHistory.push({ status: order.status, note: "Payment received (Stripe)" });
        await order.save();
        sendEmail({ to: order.email, ...orderStatusEmail(order) }).catch(() => {});
      }
    }
  }

  res.json({ received: true });
});
