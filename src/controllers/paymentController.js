const Order = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const PaymentSettings = require('../models/PaymentSettings');
const CustomError = require('../utils/CustomError');
const socketService = require('../services/socketService');

const getOrCreatePaymentSettings = async () => {
  let settings = await PaymentSettings.findOne();
  if (!settings) {
    settings = await PaymentSettings.create({
      directBankTransfer: {
        enabled: true,
        bankName: 'National Australia Bank (NAB)',
        accountName: 'Aurex Truck Parts Pty Ltd',
        bsbOrRouting: '083-004',
        accountNumber: '123456789',
        instructions: 'Please include your Order Number as payment reference. Stock will be dispatched upon EFT settlement.'
      },
      tradeAccount30Days: {
        enabled: true,
        description: 'Approved 30-Day commercial credit account for registered fleet operators.',
        requireApproval: true
      },
      codDepotPickup: {
        enabled: true,
        description: 'Pay on collection at Sydney Central Parts Warehouse (Card or Cash).',
        warehouseAddress: '100 Industrial Drive, Transport Logistics Hub, Sydney NSW'
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
  reply.send({
    success: true,
    data: {
      directBankTransfer: settings.directBankTransfer,
      tradeAccount30Days: settings.tradeAccount30Days,
      codDepotPickup: settings.codDepotPickup,
      purchaseOrders: settings.purchaseOrders,
      card: { enabled: Boolean(process.env.STRIPE_SECRET_KEY) }
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

  // A reference is the customer telling us to look for the money, not proof it arrived:
  // the order stays unpaid until staff reconcile it (mark-paid / status update).
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
    amount: order.pricing.grandTotal
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
  const { paidAmount, notes } = request.body;

  const order = await Order.findById(orderId);
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  order.payment.status = 'PAID';
  order.payment.paidAt = new Date();
  order.payment.paidAmount = Number(paidAmount) || order.pricing.grandTotal;
  if (notes) order.payment.paymentNotes = notes;
  // Paid orders move to the first fulfilment step the storefront timeline knows.
  if (['Pending payment', 'PENDING_PAYMENT'].includes(order.orderStatus)) {
    order.orderStatus = 'Confirmed';
  }

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Payment of $${order.payment.paidAmount.toFixed(2)} verified by ${request.user.name}`,
    updatedBy: request.user._id
  });

  socketService.broadcast('ORDER_PAID', {
    orderNumber: order.orderNumber,
    paidAmount: order.payment.paidAmount
  });

  reply.send({
    success: true,
    message: 'Order marked as PAID',
    data: { order }
  });
};

const createCheckoutSession = async (request, reply) => {
  const { ref } = request.body || {};
  if (!process.env.STRIPE_SECRET_KEY) {
    return reply.status(400).send({
      success: false,
      error: 'Stripe gateway unconfigured. Demo card confirmation active.'
    });
  }

  try {
    const mongoose = require('mongoose');
    let order = await Order.findOne({ orderNumber: ref });
    if (!order && mongoose.Types.ObjectId.isValid(ref)) {
      order = await Order.findById(ref);
    }
    if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');

    const totalAmount = Math.max(50, Math.round((order.pricing?.grandTotal || order.total || 0) * 100));
    const customerEmail = order.shippingAddress?.email || order.guestEmail || request.user?.email;

    const sessionPayload = {
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: `Aurex Truck Parts - Order #${order.orderNumber}`,
            description: (order.items || []).map((i) => `${i.name || i.sku} (x${i.quantity || i.qty || 1})`).join(', ').slice(0, 500) || 'Truck Parts Order',
          },
          unit_amount: totalAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/order-success/${order.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?payment_canceled=true&orderNumber=${order.orderNumber}`,
      client_reference_id: order.orderNumber,
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
      },
    };

    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      sessionPayload.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    reply.send({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    reply.status(400).send({
      success: false,
      error: err.message,
    });
  }
};

const verifySession = async (request, reply) => {
  const { sessionId } = request.query || {};
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) {
    return reply.send({ success: false, message: 'Missing sessionId or secret key' });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
      const orderNumber = session.client_reference_id || session.metadata?.orderNumber;
      if (orderNumber) {
        const order = await Order.findOne({ orderNumber });
        if (order) {
          order.payment.status = 'PAID';
          order.payment.method = 'Card';
          order.payment.paidAt = new Date();
          if (!['Packed', 'Packed in Campbellfield VIC', 'Dispatched', 'Courier booked', 'In transit', 'Delivered'].includes(order.orderStatus)) {
            order.orderStatus = 'Confirmed';
          }
          await order.save();

          // Clear backend cart upon verified payment
          if (order.user) {
            try {
              const Cart = require('../models/Cart');
              await Cart.findOneAndUpdate({ user: order.user }, { items: [], subtotal: 0, totalCoreDeposit: 0, totalWeightKg: 0 });
            } catch {}
          }

          const { normalizeOrder } = require('./orderController');
          return reply.send({ success: true, paid: true, orderNumber, order: normalizeOrder(order) });
        }
      }
    }
    reply.send({ success: true, paid: session?.payment_status === 'paid' });
  } catch (err) {
    reply.send({ success: false, error: err.message });
  }
};

const cancelOrderPayment = async (request, reply) => {
  const { orderNumber } = request.body || request.query || {};
  if (!orderNumber) {
    return reply.status(400).send({ success: false, error: 'Missing orderNumber' });
  }

  const mongoose = require('mongoose');
  let order = await Order.findOne({ orderNumber });
  if (!order && mongoose.Types.ObjectId.isValid(orderNumber)) {
    order = await Order.findById(orderNumber);
  }
  if (!order) {
    return reply.status(404).send({ success: false, error: 'Order not found' });
  }

  // If already paid, do not cancel
  if (order.payment?.status === 'PAID') {
    return reply.send({ success: true, message: 'Order is already paid', order });
  }

  order.orderStatus = 'Payment failed';
  order.payment.status = 'CANCELLED';
  order.payment.paymentNotes = 'Payment cancelled / abandoned by customer at Stripe checkout.';
  await order.save();

  // Restock inventory
  try {
    const Product = require('../models/Product');
    const InventoryTransaction = require('../models/InventoryTransaction');
    for (const item of order.items || []) {
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod && prod.inventory?.trackInventory) {
          prod.inventory.stock = (prod.inventory.stock || 0) + (item.quantity || 1);
          await prod.save();

          await InventoryTransaction.create({
            product: prod._id,
            type: 'ADJUSTMENT',
            quantity: item.quantity || 1,
            reference: `CANCEL_${order.orderNumber}`,
            reason: 'Restocked due to cancelled Stripe checkout payment'
          }).catch(() => {});
        }
      }
    }
  } catch {}

  await OrderStatusHistory.create({
    order: order._id,
    status: 'Payment failed',
    comment: 'Payment was not completed at Stripe checkout. Order marked as failed/cancelled.'
  }).catch(() => {});

  reply.send({
    success: true,
    message: 'Order payment cancelled successfully',
    data: { order }
  });
};

const { verifyWebhookSignature } = require('../utils/webhookVerifier');

const handleWebhook = async (request, reply) => {
  const sig = request.headers['stripe-signature'] || request.headers['x-webhook-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return reply.status(400).send({ success: false, error: 'Webhook secret or signature missing' });
  }

  // Timing-safe verification
  const isValid = verifyWebhookSignature(request.body, sig, webhookSecret);
  if (!isValid) {
    return reply.status(400).send({ success: false, error: 'Invalid webhook signature' });
  }

  const event = request.body || {};
  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object;
    const orderNumber = session?.client_reference_id;
    if (orderNumber) {
      const order = await Order.findOne({ orderNumber });
      if (order) {
        order.payment.status = 'PAID';
        order.payment.method = 'Card';
        order.payment.paidAt = new Date();
        order.payment.transactionId = session.payment_intent || session.id;
        order.orderStatus = 'Confirmed';
        await order.save();
      }
    }
  }

  reply.send({ success: true, received: true });
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
