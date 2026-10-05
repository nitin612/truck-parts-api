const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const InventoryTransaction = require('../models/InventoryTransaction');
const CustomError = require('../utils/CustomError');
const socketService = require('../services/socketService');
const { calculateOrderTotals } = require('../utils/pricing');
const { sendOrderConfirmationEmail } = require('../services/notificationService');

const generateOrderNumber = () => {
  return 'ATP-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
};

const createOrder = async (request, reply) => {
  const userId = request.user._id;
  const {
    addressId,
    couponCode,
    paymentMethod = 'DIRECT_BANK_TRANSFER',
    shippingMethod = 'STANDARD',
    purchaseOrderNumber,
    customerNotes,
    items: passedItems
  } = request.body;

  let rawItems = [];
  if (passedItems && passedItems.length > 0) {
    rawItems = passedItems;
  } else {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new CustomError('Your cart is empty', 400, 'EMPTY_CART');
    }
    rawItems = cart.items.map(item => ({
      productId: item.product,
      quantity: item.quantity
    }));
  }

  // 1. Fetch Shipping Address
  let shippingAddress = null;
  if (addressId) {
    const addressDoc = await Address.findOne({ _id: addressId, user: userId });
    if (addressDoc) {
      shippingAddress = {
        companyName: addressDoc.companyName || request.user.companyName,
        fullName: addressDoc.fullName,
        phone: addressDoc.phone,
        email: addressDoc.email || request.user.email,
        addressLine1: addressDoc.addressLine1,
        addressLine2: addressDoc.addressLine2,
        suburbOrCity: addressDoc.suburbOrCity,
        state: addressDoc.state,
        postalCode: addressDoc.postalCode,
        country: addressDoc.country,
        deliveryInstructions: addressDoc.deliveryInstructions,
        hasForkliftOnSite: addressDoc.hasForkliftOnSite
      };
    }
  }

  // Fallback shipping address from user profile if not provided
  if (!shippingAddress) {
    shippingAddress = {
      companyName: request.user.companyName || 'Workshop / Fleet',
      fullName: `${request.user.firstName} ${request.user.lastName}`,
      phone: request.user.phone || '0400000000',
      email: request.user.email,
      addressLine1: 'Warehouse Counter Collection',
      suburbOrCity: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'Australia',
      hasForkliftOnSite: true
    };
  }

  // 2. Validate stock and look up DB prices
  const verifiedItems = [];
  for (const raw of rawItems) {
    const product = await Product.findById(raw.productId);
    if (!product || product.status !== 'PUBLISHED' || product.isBuyable === false) {
      throw new CustomError(`Product ${product ? product.name : 'Item'} is currently unavailable for online purchase`, 400, 'PRODUCT_UNAVAILABLE');
    }

    if (product.pricing?.isPOA) {
      throw new CustomError(`Part ${product.name} is Price On Application. Please submit a quote request instead.`, 400, 'POA_PRODUCT');
    }

    if (product.inventory?.trackInventory && product.inventory.stock < raw.quantity) {
      throw new CustomError(`Insufficient stock for ${product.name}. Available: ${product.inventory.stock}`, 400, 'INSUFFICIENT_STOCK');
    }

    const unitPrice = product.pricing.sellingPrice;
    const coreDeposit = product.coreDeposit?.required ? (product.coreDeposit.amount || 0) : 0;
    const weightKg = product.dimensions?.weightKg || 1.0;

    verifiedItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      oemPartNumber: product.oemPartNumber,
      brandName: product.brandName,
      image: product.images?.[0]?.url || '',
      quantity: raw.quantity,
      unitPrice,
      coreDeposit,
      weightKg,
      total: unitPrice * raw.quantity
    });
  }

  // 3. Validate Coupon if provided
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
  }

  // 4. Calculate Server-side Trusted Totals
  const tradeDiscountPercent = request.user.isTradeApproved ? (request.user.tradeDiscountPercent || 0) : 0;
  const pricingTotals = calculateOrderTotals({
    items: verifiedItems,
    coupon,
    shippingMethod,
    destinationState: shippingAddress.state,
    tradeDiscountPercent
  });

  // 5. Check Trade Account Credit Limit if paying via 30-day invoice
  if (paymentMethod === 'TRADE_ACCOUNT_30_DAYS') {
    if (!request.user.isTradeApproved) {
      throw new CustomError('Your account has not been approved for 30-Day Commercial Trade Credit.', 403, 'TRADE_CREDIT_UNAPPROVED');
    }
    const newBalance = (request.user.creditBalance || 0) + pricingTotals.grandTotal;
    if (request.user.creditLimit > 0 && newBalance > request.user.creditLimit) {
      throw new CustomError(`Order exceeds available trade credit limit. Credit Limit: $${request.user.creditLimit}, Current Balance: $${request.user.creditBalance}`, 400, 'CREDIT_LIMIT_EXCEEDED');
    }
    request.user.creditBalance = newBalance;
    await request.user.save();
  }

  // 6. Create Order in Database
  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: verifiedItems,
    shippingAddress,
    pricing: pricingTotals,
    coupon: coupon ? coupon._id : undefined,
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'TRADE_ACCOUNT_30_DAYS' ? 'AUTHORIZED' : 'PENDING',
      purchaseOrderNumber
    },
    shipping: {
      shippingMethod,
      status: 'PROCESSING'
    },
    orderStatus: paymentMethod === 'TRADE_ACCOUNT_30_DAYS' ? 'CONFIRMED' : 'PENDING_PAYMENT',
    customerNotes
  });

  // 7. Decrement stock & record inventory transactions
  for (const item of verifiedItems) {
    const prod = await Product.findById(item.product);
    if (prod && prod.inventory?.trackInventory) {
      const prevStock = prod.inventory.stock;
      const newStock = Math.max(0, prevStock - item.quantity);
      prod.inventory.stock = newStock;
      await prod.save();

      await InventoryTransaction.create({
        product: prod._id,
        type: 'SALE',
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: newStock,
        referenceType: 'Order',
        referenceId: order._id,
        notes: `Order #${order.orderNumber}`
      });
    }
  }

  // 8. Log initial status history
  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Order placed with payment method ${paymentMethod.replace(/_/g, ' ')}`
  });

  // 9. Clear user's cart
  await Cart.findOneAndUpdate({ user: userId }, { items: [], subtotal: 0, totalCoreDeposit: 0, totalWeightKg: 0 });

  // 10. Realtime notification to Admin & Email to customer
  socketService.broadcast('NEW_ORDER_PLACED', {
    orderNumber: order.orderNumber,
    customerName: shippingAddress.fullName,
    grandTotal: order.pricing.grandTotal,
    paymentMethod: order.payment.method,
    itemsCount: order.items.length,
    createdAt: order.createdAt
  });

  sendOrderConfirmationEmail(order).catch(err => console.error('Order email error:', err));

  reply.status(201).send({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
};

const getMyOrders = async (request, reply) => {
  const orders = await Order.find({ user: request.user._id })
    .sort({ createdAt: -1 });

  reply.send({
    success: true,
    count: orders.length,
    data: { orders }
  });
};

const getOrderByNumber = async (request, reply) => {
  const { orderNumber } = request.params;
  const order = await Order.findOne({ orderNumber, user: request.user._id });
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  const history = await OrderStatusHistory.find({ order: order._id }).sort({ createdAt: 1 });

  reply.send({
    success: true,
    data: { order, history }
  });
};

const trackOrderByRef = async (request, reply) => {
  const { orderNumber } = request.params;
  const order = await Order.findOne({ orderNumber }).select('orderNumber orderStatus shipping createdAt pricing.grandTotal');
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  reply.send({
    success: true,
    data: { order }
  });
};

const adminGetOrders = async (request, reply) => {
  const { status, paymentStatus, search, page = 1, limit = 50 } = request.query;
  const filter = {};

  if (status) filter.orderStatus = status;
  if (paymentStatus) filter['payment.status'] = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.companyName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email companyName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const adminGetOrderDetail = async (request, reply) => {
  const order = await Order.findById(request.params.id)
    .populate('user', 'firstName lastName email companyName abnOrTaxId phone');
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  const history = await OrderStatusHistory.find({ order: order._id })
    .populate('updatedBy', 'name role')
    .sort({ createdAt: 1 });

  reply.send({
    success: true,
    data: { order, history }
  });
};

const adminUpdateOrderStatus = async (request, reply) => {
  const { status, note, trackingNumber, carrier, consignmentId } = request.body;
  const order = await Order.findById(request.params.id);
  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  if (status) order.orderStatus = status;
  if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
  if (carrier) order.shipping.carrier = carrier;
  if (consignmentId) order.shipping.consignmentId = consignmentId;

  if (status === 'DISPATCHED') {
    order.shipping.status = 'DISPATCHED';
    order.shipping.dispatchedAt = new Date();
  } else if (status === 'DELIVERED') {
    order.shipping.status = 'DELIVERED';
    order.shipping.deliveredAt = new Date();
  }

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: status || order.orderStatus,
    comment: note || `Order status updated to ${status}`,
    updatedBy: request.user._id
  });

  socketService.broadcast('ORDER_STATUS_CHANGED', {
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    trackingNumber: order.shipping.trackingNumber
  });

  reply.send({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  trackOrderByRef,
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus
};
