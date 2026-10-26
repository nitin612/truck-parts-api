const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const PaymentSettings = require('../models/PaymentSettings');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const InventoryTransaction = require('../models/InventoryTransaction');
const CustomError = require('../utils/CustomError');
const socketService = require('../services/socketService');
const { sendOrderConfirmedEmail } = require('../services/notificationService');
const { resolveAppUrl } = require('../utils/origin');
const { getAccessSecret } = require('../utils/token');
const { normalizeOrder } = require('./orderController');

// Signed per-order token carried in Stripe's cancel_url, so a guest can cancel only their own abandoned checkout
const cancelTokenFor = (orderNumber) =>
  crypto.createHmac('sha256', getAccessSecret()).update(`cancel:${orderNumber}`).digest('hex').slice(0, 32);

const cancelSummary = (order) => ({
  orderNumber: order.orderNumber,
  orderStatus: order.orderStatus,
  paymentStatus: order.payment?.status
});

/**
 * Returns a configured Stripe SDK instance or null if secret key is unconfigured.
 */
const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!secretKey) return null;
  return require('stripe')(secretKey);
};

const getOrCreatePaymentSettings = async () => {
  let settings = await PaymentSettings.findOne();
  if (!settings) {
    settings = await PaymentSettings.create({
      directBankTransfer: {
        enabled: true,
        bankName: 'NAB Australia Ltd',
        accountName: 'Aurex Panels Pty Limited',
        bsbOrRouting: '083-419',
        accountNumber: '90-287-1454',
        instructions: 'Please include your Order Number as payment reference. Stock will be dispatched upon EFT settlement.'
      },
      tradeAccount30Days: {
        enabled: true,
        description: 'Approved 30-Day commercial credit account for registered fleet operators.',
        requireApproval: true
      },
      codDepotPickup: {
        enabled: true,
        description: 'Pay on collection at Campbellfield Parts Warehouse (Card or Cash).',
        warehouseAddress: '77 Capital Link Drive, Campbellfield VIC 3061'
      },
      purchaseOrders: {
        enabled: true,
        requirePONumber: true
      }
    });
  }
  return settings;
};

const getPublicPaymentConfig = async (request, reply) => {
  const settings = await getOrCreatePaymentSettings();
  const stripeActive = Boolean((process.env.STRIPE_SECRET_KEY || '').trim());
  reply.send({
    success: true,
    data: {
      directBankTransfer: settings.directBankTransfer,
      tradeAccount30Days: settings.tradeAccount30Days,
      codDepotPickup: settings.codDepotPickup,
      purchaseOrders: settings.purchaseOrders,
      card: { enabled: stripeActive }
    }
  });
};

const submitPaymentProof = async (request, reply) => {
  const { orderId, bankTransferReference, notes } = request.body || {};
  if (!request.user) {
    throw new CustomError('Log in to add a payment reference to your order.', 401, 'UNAUTHORIZED');
  }
  if (!/^[0-9a-fA-F]{24}$/.test(String(orderId || '')) || !String(bankTransferReference || '').trim()) {
    throw new CustomError('An order and a transfer reference are required.', 400, 'MISSING_FIELDS');
  }

  const order = await Order.findOne({ _id: orderId, user: request.user._id });
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  order.payment.bankTransferReference = String(bankTransferReference).trim().slice(0, 80);
  order.payment.paymentNotes = String(notes || '').trim().slice(0, 300);

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Payment reference submitted: ${order.payment.bankTransferReference}`
  });

  socketService.broadcast('PAYMENT_REFERENCE_SUBMITTED', {
    orderNumber: order.orderNumber,
    reference: bankTransferReference,
    amount: order.pricing?.grandTotal || order.total || 0
  });

  reply.send({
    success: true,
    message: 'Payment reference submitted successfully. Our accounts team will reconcile and dispatch your parts.',
    data: { order }
  });
};

const adminGetPaymentSettings = async (request, reply) => {
  const settings = await getOrCreatePaymentSettings();
  reply.send({
    success: true,
    data: { settings }
  });
};

const adminUpdatePaymentSettings = async (request, reply) => {
  let settings = await getOrCreatePaymentSettings();
  Object.assign(settings, request.body);
  await settings.save();

  reply.send({
    success: true,
    message: 'Payment configuration updated successfully',
    data: { settings }
  });
};

const adminMarkOrderPaid = async (request, reply) => {
  const { orderId } = request.params;
  const { paidAmount, notes } = request.body || {};

  const order = await Order.findById(orderId);
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  order.payment.status = 'PAID';
  order.payment.paidAt = new Date();
  order.payment.paidAmount = Number(paidAmount) || order.pricing?.grandTotal || order.total || 0;
  if (notes) order.payment.paymentNotes = notes;

  if (['Pending payment', 'PENDING_PAYMENT'].includes(order.orderStatus)) {
    order.orderStatus = 'Confirmed';
  }

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Payment of $${order.payment.paidAmount.toFixed(2)} verified by ${request.user.name || 'Admin'}`,
    updatedBy: request.user._id
  });

  socketService.broadcast('ORDER_PAID', {
    orderNumber: order.orderNumber,
    paidAmount: order.payment.paidAmount
  });

  sendOrderConfirmedEmail(order).catch((err) => console.error('[Order Confirmation Email Error]:', err));

  reply.send({
    success: true,
    message: 'Order marked as PAID',
    data: { order }
  });
};

/**
 * Creates a hosted Stripe Checkout Session for an existing order.
 */
const createCheckoutSession = async (request, reply) => {
  const { ref } = request.body || {};
  if (!ref) {
    return reply.status(400).send({
      success: false,
      error: 'Order reference is required.'
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return reply.status(400).send({
      success: false,
      error: 'Stripe gateway unconfigured. Please check back soon or choose bank transfer.'
    });
  }

  try {
    let order = await Order.findOne({ orderNumber: ref });
    if (!order && mongoose.Types.ObjectId.isValid(ref)) {
      order = await Order.findById(ref);
    }
    if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

    // IDOR Protection: verify user ownership if logged in
    if (request.user) {
      const isOwner = order.user && String(order.user) === String(request.user._id);
      const isStaff = ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
      if (order.user && !isOwner && !isStaff) {
        throw new CustomError('You are not authorized to pay for this order.', 403, 'FORBIDDEN');
      }
    }

    // State validation
    if (order.payment?.status === 'PAID') {
      return reply.status(400).send({
        success: false,
        error: 'This order has already been paid.'
      });
    }

    if (['Cancelled', 'Payment failed'].includes(order.orderStatus) && order.payment?.status === 'CANCELLED') {
      return reply.status(400).send({
        success: false,
        error: 'This order was cancelled. Please place a new order.'
      });
    }

    const appUrl = resolveAppUrl(request);
    const grandTotal = Number(order.pricing?.grandTotal ?? order.total ?? 0);
    if (isNaN(grandTotal) || grandTotal <= 0) {
      throw new CustomError('Invalid order total for payment.', 400, 'INVALID_AMOUNT');
    }

    // Stripe requires amounts in smallest currency unit (cents). Minimum AUD 0.50 ($0.50 AUD)
    const totalAmount = Math.max(50, Math.round(grandTotal * 100));
    const customerEmail = order.shippingAddress?.email || order.guestEmail || request.user?.email;

    const itemsSummary = (order.items || [])
      .map((i) => `${i.name || i.sku} (x${i.quantity || i.qty || 1})`)
      .join(', ')
      .slice(0, 500) || 'Commercial Truck Parts';

    const sessionPayload = {
      line_items: [{
        price_data: {
          currency: (process.env.STORE_CURRENCY || 'aud').toLowerCase(),
          product_data: {
            name: `Aurex Truck Parts - Order #${order.orderNumber}`,
            description: itemsSummary,
          },
          unit_amount: totalAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/order-success/${order.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?payment_canceled=true&orderNumber=${order.orderNumber}&ct=${cancelTokenFor(order.orderNumber)}`,
      client_reference_id: order.orderNumber,
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
      },
      payment_intent_data: {
        description: `Aurex Truck Parts Order #${order.orderNumber}`,
        metadata: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
        }
      }
    };

    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      sessionPayload.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    // Save sessionId reference on order
    order.payment.stripeSessionId = session.id;
    await order.save();

    reply.send({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    reply.status(err.statusCode || 400).send({
      success: false,
      error: err.message || 'Could not initialize Stripe Checkout session.',
    });
  }
};

/**
 * Verifies a Stripe Checkout Session status on the frontend order-success page.
 * Completely idempotent: prevents duplicate emails and status logs.
 */
const verifySession = async (request, reply) => {
  const { sessionId } = request.query || {};
  if (!sessionId) {
    return reply.status(400).send({ success: false, error: 'Missing sessionId query parameter.' });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return reply.status(400).send({ success: false, error: 'Stripe gateway is unconfigured.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.payment_status === 'paid') {
      const orderNumber = session.client_reference_id || session.metadata?.orderNumber;
      const orderId = session.metadata?.orderId;

      let order = null;
      if (orderNumber) {
        order = await Order.findOne({ orderNumber });
      }
      if (!order && orderId && mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }

      if (order) {
        const wasAlreadyPaid = order.payment?.status === 'PAID';

        order.payment.status = 'PAID';
        order.payment.method = 'Card';
        order.payment.paidAt = order.payment.paidAt || new Date();
        order.payment.paidAmount = session.amount_total ? session.amount_total / 100 : (order.pricing?.grandTotal || order.total || 0);
        order.payment.transactionId = session.payment_intent
          ? (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id)
          : session.id;
        order.payment.stripeSessionId = session.id;

        const terminalStatuses = ['Packed', 'Packed in Campbellfield VIC', 'Dispatched', 'Courier booked', 'In transit', 'Delivered'];
        if (!terminalStatuses.includes(order.orderStatus)) {
          order.orderStatus = 'Confirmed';
        }

        await order.save();

        if (!wasAlreadyPaid) {
          await OrderStatusHistory.create({
            order: order._id,
            status: order.orderStatus,
            comment: `Card payment of $${order.payment.paidAmount.toFixed(2)} verified via Stripe (Tx: ${order.payment.transactionId})`
          }).catch(() => {});

          socketService.broadcast('ORDER_PAID', {
            orderNumber: order.orderNumber,
            paidAmount: order.payment.paidAmount,
            transactionId: order.payment.transactionId
          });

          sendOrderConfirmedEmail(order).catch((err) => console.error('[Order Confirmation Email Error]:', err));
        }

        // Clear user's cart in backend
        if (order.user) {
          try {
            await Cart.findOneAndUpdate(
              { user: order.user },
              { items: [], subtotal: 0, totalCoreDeposit: 0, totalWeightKg: 0 }
            );
          } catch {}
        }

        return reply.send({
          success: true,
          paid: true,
          orderNumber: order.orderNumber,
          order: normalizeOrder(order)
        });
      }
    }

    reply.send({ success: true, paid: session?.payment_status === 'paid' });
  } catch (err) {
    reply.status(400).send({ success: false, error: err.message });
  }
};

/**
 * Handles customer cancellation / abandonment at Stripe Checkout.
 * Restocks inventory safely and only ONCE to prevent infinite stock inflation.
 */
const cancelOrderPayment = async (request, reply) => {
  const { orderNumber, cancelToken } = request.body || request.query || {};
  if (!orderNumber || typeof orderNumber !== 'string') {
    return reply.status(400).send({ success: false, error: 'Missing orderNumber' });
  }

  let order = await Order.findOne({ orderNumber });
  if (!order && mongoose.Types.ObjectId.isValid(orderNumber)) {
    order = await Order.findById(orderNumber);
  }
  if (!order) {
    return reply.status(404).send({ success: false, error: 'Order not found' });
  }

  // Only the owner, staff, or whoever holds the signed cancel link from Stripe may cancel
  const isStaff = !!request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  const isOwner = !!request.user && !!order.user && String(order.user) === String(request.user._id);
  const expectedToken = cancelTokenFor(order.orderNumber);
  const hasValidToken = typeof cancelToken === 'string' &&
    cancelToken.length === expectedToken.length &&
    crypto.timingSafeEqual(Buffer.from(cancelToken), Buffer.from(expectedToken));
  if (!isStaff && !isOwner && !hasValidToken) {
    throw new CustomError('You are not authorized to cancel this order.', 403, 'FORBIDDEN');
  }

  // This endpoint exists for abandoned Stripe checkouts; bank transfer / trade account / pickup orders are cancelled by staff
  if (!/^card$/i.test(order.payment?.method || '')) {
    return reply.status(400).send({ success: false, error: 'Only unpaid card checkouts can be cancelled here.' });
  }

  // If already paid, do not cancel
  if (order.payment?.status === 'PAID') {
    return reply.send({ success: true, message: 'Order is already paid', data: cancelSummary(order) });
  }

  // Prevent multiple restocks if already cancelled or failed
  if (order.payment?.status === 'CANCELLED' || order.orderStatus === 'Payment failed') {
    return reply.send({
      success: true,
      message: 'Order is already cancelled',
      data: cancelSummary(order)
    });
  }

  // Don't cancel a checkout Stripe has already taken payment for (webhook may still be in flight),
  // and close an open session so it can't be paid after the order is cancelled
  const stripe = getStripeClient();
  if (stripe && order.payment?.stripeSessionId?.startsWith('cs_')) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.payment.stripeSessionId);
      if (session.payment_status === 'paid') {
        return reply.send({ success: true, message: 'Order is already paid', data: cancelSummary(order) });
      }
      if (session.status === 'open') {
        await stripe.checkout.sessions.expire(session.id);
      }
    } catch (stripeErr) {
      console.warn('[Cancel Order] Could not check Stripe session:', stripeErr.message);
    }
  }

  // Prevent cancellation of dispatched/delivered orders
  if (['Dispatched', 'Delivered', 'In transit'].includes(order.orderStatus)) {
    return reply.status(400).send({
      success: false,
      error: 'Cannot cancel an order that has already been dispatched.'
    });
  }

  order.orderStatus = 'Payment failed';
  order.payment.status = 'CANCELLED';
  order.payment.paymentNotes = 'Payment cancelled / abandoned by customer at Stripe checkout.';
  await order.save();

  // Restock inventory exactly once
  try {
    for (const item of order.items || []) {
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod && prod.inventory?.trackInventory) {
          const prevStock = prod.inventory.stock || 0;
          const newStock = prevStock + (item.quantity || 1);
          prod.inventory.stock = newStock;
          await prod.save();

          await InventoryTransaction.create({
            product: prod._id,
            type: 'ADJUSTMENT',
            quantity: item.quantity || 1,
            previousStock: prevStock,
            newStock: newStock,
            referenceType: 'Order',
            referenceId: order._id,
            notes: `Restocked due to cancelled Stripe checkout payment for #${order.orderNumber}`
          }).catch(() => {});
        }
      }
    }
  } catch (restockErr) {
    console.error('[Inventory Restock Error]:', restockErr);
  }

  await OrderStatusHistory.create({
    order: order._id,
    status: 'Payment failed',
    comment: 'Payment was not completed at Stripe checkout. Order marked as failed/cancelled.'
  }).catch(() => {});

  reply.send({
    success: true,
    message: 'Order payment cancelled successfully',
    data: cancelSummary(order)
  });
};

/**
 * Handles successful Stripe Checkout payments from webhooks.
 */
const handlePaymentSuccess = async (session) => {
  const orderNumber = session.client_reference_id || session.metadata?.orderNumber;
  const orderId = session.metadata?.orderId;

  let order = null;
  if (orderNumber) {
    order = await Order.findOne({ orderNumber });
  }
  if (!order && orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findById(orderId);
  }

  if (!order) {
    console.warn(`[Stripe Webhook Warning]: Order not found for session ${session.id} (ref: ${orderNumber})`);
    return;
  }

  // Idempotency: skip if already paid
  if (order.payment?.status === 'PAID') {
    return;
  }

  order.payment.status = 'PAID';
  order.payment.method = 'Card';
  order.payment.paidAt = new Date();
  order.payment.paidAmount = session.amount_total ? session.amount_total / 100 : (order.pricing?.grandTotal || order.total || 0);
  order.payment.transactionId = session.payment_intent
    ? (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id)
    : session.id;
  order.payment.stripeSessionId = session.id;

  const terminalStatuses = ['Packed', 'Packed in Campbellfield VIC', 'Dispatched', 'Courier booked', 'In transit', 'Delivered'];
  if (!terminalStatuses.includes(order.orderStatus)) {
    order.orderStatus = 'Confirmed';
  }

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Card payment of $${order.payment.paidAmount.toFixed(2)} verified via Stripe webhook (Tx: ${order.payment.transactionId})`
  }).catch(() => {});

  socketService.broadcast('ORDER_PAID', {
    orderNumber: order.orderNumber,
    paidAmount: order.payment.paidAmount,
    transactionId: order.payment.transactionId
  });

  sendOrderConfirmedEmail(order).catch((err) => console.error('[Order Confirmation Email Error]:', err));

  // Clear user's cart in backend
  if (order.user) {
    try {
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], subtotal: 0, totalCoreDeposit: 0, totalWeightKg: 0 }
      );
    } catch {}
  }
};

/**
 * Handles asynchronous payment failures or session expiration.
 */
const handlePaymentFailure = async (session, reason) => {
  const orderNumber = session.client_reference_id || session.metadata?.orderNumber;
  const orderId = session.metadata?.orderId;

  let order = null;
  if (orderNumber) {
    order = await Order.findOne({ orderNumber });
  }
  if (!order && orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findById(orderId);
  }

  if (!order || order.payment?.status === 'PAID' || order.payment?.status === 'CANCELLED') {
    return;
  }

  order.orderStatus = 'Payment failed';
  order.payment.status = 'CANCELLED';
  order.payment.paymentNotes = reason || 'Payment failed or expired at Stripe.';
  await order.save();

  // Restock inventory exactly once
  try {
    for (const item of order.items || []) {
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod && prod.inventory?.trackInventory) {
          const prevStock = prod.inventory.stock || 0;
          const newStock = prevStock + (item.quantity || 1);
          prod.inventory.stock = newStock;
          await prod.save();

          await InventoryTransaction.create({
            product: prod._id,
            type: 'ADJUSTMENT',
            quantity: item.quantity || 1,
            previousStock: prevStock,
            newStock: newStock,
            referenceType: 'Order',
            referenceId: order._id,
            notes: `Restocked due to ${reason} for #${order.orderNumber}`
          }).catch(() => {});
        }
      }
    }
  } catch {}

  await OrderStatusHistory.create({
    order: order._id,
    status: 'Payment failed',
    comment: reason || 'Payment failed at Stripe.'
  }).catch(() => {});
};

/**
 * Handles refund events from Stripe dashboard or API.
 */
const handleChargeRefunded = async (charge) => {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  const order = await Order.findOne({
    $or: [
      { 'payment.transactionId': paymentIntentId },
      { 'payment.stripeSessionId': charge.id }
    ]
  });

  if (!order) return;

  order.payment.status = 'REFUNDED';
  order.payment.paymentNotes = (order.payment.paymentNotes ? `${order.payment.paymentNotes} | ` : '') +
    `Refund processed via Stripe for $${((charge.amount_refunded || charge.amount || 0) / 100).toFixed(2)}.`;
  
  if (order.orderStatus !== 'Delivered') {
    order.orderStatus = 'Cancelled';
  }

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Payment refunded via Stripe ($${((charge.amount_refunded || 0) / 100).toFixed(2)})`
  }).catch(() => {});

  socketService.broadcast('ORDER_REFUNDED', {
    orderNumber: order.orderNumber,
    refundedAmount: (charge.amount_refunded || 0) / 100
  });
};

/**
 * Inbound Stripe Webhook receiver with cryptographic signature verification.
 */
const handleWebhook = async (request, reply) => {
  const sig = request.headers['stripe-signature'];
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Stripe Webhook Error]: STRIPE_WEBHOOK_SECRET is unconfigured on server.');
      return reply.status(500).send({ success: false, error: 'Webhook secret unconfigured on server' });
    }
    console.warn('[Stripe Webhook Warning]: STRIPE_WEBHOOK_SECRET is missing in development.');
    return reply.status(400).send({ success: false, error: 'STRIPE_WEBHOOK_SECRET not set in .env' });
  }

  if (!sig) {
    return reply.status(400).send({ success: false, error: 'Stripe signature header (stripe-signature) missing' });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return reply.status(500).send({ success: false, error: 'STRIPE_SECRET_KEY missing on server' });
  }

  let event;
  try {
    const rawPayload = request.rawBody || request.body;
    event = stripe.webhooks.constructEvent(rawPayload, sig, webhookSecret);
  } catch (err) {
    console.error(`[Stripe Webhook Signature Verification Failed]: ${err.message}`);
    return reply.status(400).send({ success: false, error: `Invalid webhook signature: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data?.object;
        if (session && session.payment_status === 'paid') {
          await handlePaymentSuccess(session);
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data?.object;
        if (session) {
          await handlePaymentFailure(session, 'Asynchronous payment failed at bank');
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data?.object;
        if (session) {
          await handlePaymentFailure(session, 'Stripe checkout session expired without payment');
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data?.object;
        if (charge) {
          await handleChargeRefunded(charge);
        }
        break;
      }

      default:
        // Other events acknowledged
        break;
    }

    return reply.send({ success: true, received: true });
  } catch (err) {
    console.error('[Stripe Webhook Processing Error]:', err);
    return reply.status(500).send({ success: false, error: 'Internal processing error' });
  }
};

module.exports = {
  getPublicPaymentConfig,
  submitPaymentProof,
  adminGetPaymentSettings,
  adminUpdatePaymentSettings,
  adminMarkOrderPaid,
  createCheckoutSession,
  verifySession,
  cancelOrderPayment,
  handleWebhook
};
