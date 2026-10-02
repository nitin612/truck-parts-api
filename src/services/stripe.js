import env from "../config/env.js";

/**
 * Stripe wrapper. The SDK is lazy-loaded so the app boots and runs even
 * when Stripe isn't configured (or the package isn't installed yet).
 * Feature-flagged by STRIPE_SECRET_KEY.
 */
let _stripe = null;
async function client() {
  if (!env.stripe.enabled) return null;
  if (_stripe) return _stripe;
  const { default: Stripe } = await import("stripe");
  _stripe = new Stripe(env.stripe.secretKey, { apiVersion: "2024-06-20" });
  return _stripe;
}

export const stripeEnabled = () => env.stripe.enabled;

/**
 * Create a PaymentIntent for an order. Amount is in cents (AUD).
 * Enables card + Afterpay/Clearpay automatic payment methods.
 */
export async function createPaymentIntent(order) {
  const s = await client();
  if (!s) throw new Error("Stripe is not configured.");
  return s.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: "aud",
    automatic_payment_methods: { enabled: true },
    metadata: { orderRef: order.ref, email: order.email },
    description: `Aurex order ${order.ref}`,
    receipt_email: order.email,
  });
}

/**
 * Create a hosted Stripe Checkout Session for an order. The storefront
 * redirects the customer to session.url; Stripe handles the card/Afterpay UI
 * and redirects back to success_url. A single line item for the grand total
 * avoids any rounding mismatch with the server-computed total.
 */
export async function createCheckoutSession(order) {
  const s = await client();
  if (!s) throw new Error("Stripe is not configured.");
  return s.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "aud",
          product_data: { name: `Aurex order ${order.ref}`, description: order.items.map((i) => `${i.name} ×${i.qty}`).join(", ").slice(0, 500) },
          unit_amount: Math.round(order.total * 100),
        },
      },
    ],
    metadata: { orderRef: order.ref, email: order.email },
    success_url: `${env.appUrl}/order-success/${order.ref}`,
    cancel_url: `${env.appUrl}/checkout`,
  });
}

/** Verify + parse a webhook event from the raw request body. */
export async function constructEvent(rawBody, signature) {
  const s = await client();
  if (!s) throw new Error("Stripe is not configured.");
  if (!env.stripe.webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  return s.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret);
}
