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
    order.orderStatus = 'Packed in Campbellfield VIC';
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
    const order = await Order.findOne({ orderNumber: ref });
    if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: `Aurex Order #${order.orderNumber}`
          },
          unit_amount: Math.round(order.pricing.grandTotal * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${appUrl}/order-success/${order.orderNumber}`,
      cancel_url: `${appUrl}/checkout`,
      client_reference_id: order.orderNumber
    });

    reply.send({
      success: true,
      url: session.url
    });
  } catch (err) {
    reply.status(400).send({
      success: false,
      error: err.message
    });
  }
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
        order.payment.paidAt = new Date();
        order.payment.transactionId = session.payment_intent || session.id;
        order.orderStatus = 'Packed in Campbellfield VIC';
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
  handleWebhook
};
