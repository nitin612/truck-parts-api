const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const SiteSetting = require('../models/SiteSetting');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const InventoryTransaction = require('../models/InventoryTransaction');
const CustomError = require('../utils/CustomError');
const socketService = require('../services/socketService');
const { calculateOrderTotals } = require('../utils/pricing');
const { sendOrderConfirmationEmail } = require('../services/notificationService');

const generateOrderNumber = () => {
  return 'ATP-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
};

const normalizeOrder = (o) => {
  if (!o) return o;
  const obj = o.toObject ? o.toObject() : o;
  const num = obj.orderNumber || (obj._id ? String(obj._id) : 'ATP-UNKNOWN');
  const items = (obj.items || []).map((i) => ({
    sku: i.sku || '',
    name: i.name || '',
    qty: i.quantity ?? i.qty ?? 1,
    quantity: i.quantity ?? i.qty ?? 1,
    price: i.unitPrice ?? i.price ?? 0,
    unitPrice: i.unitPrice ?? i.price ?? 0,
    total: i.total ?? ((i.quantity ?? i.qty ?? 1) * (i.unitPrice ?? i.price ?? 0)),
    image: i.image || '',
    product: i.product || null
  }));

  const addr = obj.shippingAddress || {};
  const normalizedAddr = {
    name: addr.fullName || addr.name || '',
    fullName: addr.fullName || addr.name || '',
    email: addr.email || obj.guestEmail || obj.user?.email || '',
    phone: addr.phone || '',
    company: addr.companyName || addr.company || '',
    companyName: addr.companyName || addr.company || '',
    address: addr.addressLine1 || addr.address || '',
    addressLine1: addr.addressLine1 || addr.address || '',
    addressLine2: addr.addressLine2 || '',
    suburb: addr.suburbOrCity || addr.suburb || '',
    suburbOrCity: addr.suburbOrCity || addr.suburb || '',
    state: addr.state || 'VIC',
    postcode: addr.postalCode || addr.postcode || '3061',
    postalCode: addr.postalCode || addr.postcode || '3061',
    notes: addr.deliveryInstructions || obj.customerNotes || ''
  };

  const grand = obj.pricing?.grandTotal ?? obj.total ?? 0;
  const sub = obj.pricing?.subtotal ?? obj.subtotal ?? grand;
  const shipFee = obj.pricing?.shippingFee ?? obj.shippingFee ?? 0;
  const disc = obj.pricing?.totalDiscount ?? obj.discount ?? 0;

  return {
    ...obj,
    id: num,
    ref: num,
    orderNumber: num,
    placedAt: obj.createdAt || new Date().toISOString(),
    createdAt: obj.createdAt || new Date().toISOString(),
    total: grand,
    subtotal: sub,
    shippingFee: shipFee,
    discount: disc,
    status: obj.orderStatus || 'Packed in Campbellfield VIC',
    orderStatus: obj.orderStatus || 'Packed in Campbellfield VIC',
    payment: obj.payment?.method || 'Card',
    paymentStatus: obj.payment?.status || 'PENDING',
    shipping: obj.shipping?.shippingMethod || 'Standard road',
    items,
    lines: items,
    address: normalizedAddr,
    shippingAddress: normalizedAddr,
    email: normalizedAddr.email || obj.guestEmail || obj.user?.email || '',
    isGuest: !!obj.isGuest
  };
};

const createOrder = async (request, reply) => {
  const userId = request.user?._id || null;
  const isGuest = !userId;

  const {
    addressId,
    couponCode,
    promoCode,
    payment,
    paymentMethod = payment || 'Card',
    shipping,
    shippingMethod = shipping || 'Standard road',
    shippingFee: passedShippingFee,
    purchaseOrderNumber,
    customerNotes,
    items: passedItems,
    address: passedAddress,
    shippingAddress: passedShippingAddress
  } = request.body || {};

  let rawItems = [];
  if (passedItems && passedItems.length > 0) {
    rawItems = passedItems;
  } else if (userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new CustomError('Your cart is empty', 400, 'EMPTY_CART');
    }
    rawItems = cart.items.map((item) => ({
      productId: item.product,
      quantity: item.quantity
    }));
  } else {
    throw new CustomError('Your cart is empty', 400, 'EMPTY_CART');
  }

  // 1. Fetch Shipping Address
  const rawAddr = passedAddress || passedShippingAddress || null;
  let shippingAddress = null;

  if (rawAddr) {
    shippingAddress = {
      companyName: rawAddr.company || rawAddr.companyName || (request.user?.companyName || ''),
      fullName: rawAddr.name || rawAddr.fullName || (request.user ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim() : 'Guest Customer'),
      phone: rawAddr.phone || request.user?.phone || '0400000000',
      email: rawAddr.email || request.user?.email || 'customer@example.com',
      addressLine1: rawAddr.address || rawAddr.addressLine1 || 'Direct Dispatch',
      addressLine2: rawAddr.addressLine2 || '',
      suburbOrCity: rawAddr.suburb || rawAddr.suburbOrCity || 'Campbellfield',
      state: rawAddr.state || 'VIC',
      postalCode: rawAddr.postcode || rawAddr.postalCode || '3061',
      country: rawAddr.country || 'Australia',
      deliveryInstructions: rawAddr.notes || rawAddr.deliveryInstructions || '',
      hasForkliftOnSite: !!rawAddr.hasForkliftOnSite
    };
  } else if (addressId && userId) {
    const addressDoc = await Address.findOne({ _id: addressId, user: userId });
    if (addressDoc) {
      shippingAddress = {
        companyName: addressDoc.companyName || request.user?.companyName || '',
        fullName: addressDoc.fullName,
        phone: addressDoc.phone,
        email: addressDoc.email || request.user?.email || '',
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

  // Fallback shipping address
  if (!shippingAddress) {
    shippingAddress = {
      companyName: request.user?.companyName || '',
      fullName: request.user ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim() : 'Customer',
      phone: request.user?.phone || '0400000000',
      email: request.user?.email || 'customer@example.com',
      addressLine1: 'Warehouse Counter Collection',
      suburbOrCity: 'Campbellfield',
      state: 'VIC',
      postalCode: '3061',
      country: 'Australia',
      hasForkliftOnSite: false
    };
  }

  // 2. Validate stock and look up DB prices
  const verifiedItems = [];
  for (const raw of rawItems) {
    const sku = (raw.sku || '').trim().toUpperCase();
    let product = null;

    if (raw.productId) {
      product = await Product.findById(raw.productId);
    } else if (sku) {
      product = await Product.findOne({ sku });
    }

    const qty = Number(raw.quantity || raw.qty || 1);

    if (product) {
      const unitPrice = (product.pricing && typeof product.pricing.sellingPrice === 'number')
        ? product.pricing.sellingPrice
        : (Number(raw.price) || 0);
      const coreDeposit = product.coreDeposit?.required ? (product.coreDeposit.amount || 0) : 0;
      const weightKg = product.dimensions?.weightKg || 1.0;

      verifiedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        oemPartNumber: product.oemPartNumber,
        brandName: product.brandName,
        image: product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : ''),
        quantity: qty,
        unitPrice,
        coreDeposit,
        weightKg,
        total: unitPrice * qty
      });
    } else {
      // Storefront custom line item fallback
      const unitPrice = Number(raw.price) || 0;
      verifiedItems.push({
        name: raw.name || sku || 'Truck Part',
        sku: sku || 'ATP-PART',
        quantity: qty,
        unitPrice,
        coreDeposit: 0,
        weightKg: 1.0,
        total: unitPrice * qty
      });
    }
  }

  // 3. Validate Coupon if provided
  const targetCode = (promoCode || couponCode || '').trim().toUpperCase();
  let coupon = null;
  if (targetCode) {
    coupon = await Coupon.findOne({ code: targetCode, isActive: true });
  }

  // 4. Calculate Server-side Trusted Totals
  const siteSettings = await SiteSetting.findOne();
  const tradeDiscountPercent = (request.user && request.user.isTradeApproved) ? (request.user.tradeDiscountPercent || 0) : 0;
  
  const pricingTotals = calculateOrderTotals({
    items: verifiedItems,
    coupon,
    shippingMethod,
    destinationState: shippingAddress.state,
    tradeDiscountPercent,
    shippingFee: passedShippingFee,
    siteSettings
  });

  // 5. Payment status & method mapping
  const normalizedMethod = String(paymentMethod).trim();
  let paymentStatus = 'PENDING';
  let initialOrderStatus = 'Pending payment';

  const isCard = normalizedMethod.toLowerCase().includes('card');
  if (isCard) {
    // If Stripe is unconfigured, card is treated as demo instant confirmation
    paymentStatus = process.env.STRIPE_SECRET_KEY ? 'PENDING' : 'PAID';
    initialOrderStatus = paymentStatus === 'PAID' ? 'Packed in Campbellfield VIC' : 'Pending payment';
  } else if (normalizedMethod === 'TRADE_ACCOUNT_30_DAYS' || normalizedMethod === '30 day fleet terms') {
    if (request.user && !request.user.isTradeApproved) {
      throw new CustomError('Your account has not been approved for 30-Day Commercial Trade Credit.', 403, 'TRADE_CREDIT_UNAPPROVED');
    }
    paymentStatus = 'AUTHORIZED';
    initialOrderStatus = 'Packed in Campbellfield VIC';
    if (request.user) {
      request.user.creditBalance = (request.user.creditBalance || 0) + pricingTotals.grandTotal;
      await request.user.save();
    }
  }

  // 6. Create Order in Database
  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    user: userId,
    isGuest,
    guestEmail: shippingAddress.email,
    items: verifiedItems,
    shippingAddress,
    pricing: pricingTotals,
    coupon: coupon ? coupon._id : undefined,
    payment: {
      method: normalizedMethod,
      status: paymentStatus,
      purchaseOrderNumber
    },
    shipping: {
      shippingMethod,
      status: 'PROCESSING'
    },
    orderStatus: initialOrderStatus,
    customerNotes: customerNotes || rawAddr?.notes || ''
  });

  // 7. Decrement stock & record inventory transactions
  for (const item of verifiedItems) {
    if (item.product) {
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
  }

  // 8. Log initial status history
  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: `Order placed with payment method ${normalizedMethod}`
  });

  // 9. Clear user's cart if authenticated
  if (userId) {
    await Cart.findOneAndUpdate({ user: userId }, { items: [], subtotal: 0, totalCoreDeposit: 0, totalWeightKg: 0 });
  }

  // 10. Realtime notification to Admin & Email to customer
  socketService.broadcast('NEW_ORDER_PLACED', {
    orderNumber: order.orderNumber,
    customerName: shippingAddress.fullName,
    grandTotal: order.pricing.grandTotal,
    paymentMethod: order.payment.method,
    itemsCount: order.items.length,
    createdAt: order.createdAt
  });

  sendOrderConfirmationEmail(order).catch((err) => console.error('Order email error:', err));

  const normalized = normalizeOrder(order);

  reply.status(201).send({
    success: true,
    message: 'Order created successfully',
    order: normalized,
    data: { order: normalized }
  });
};

const getMyOrders = async (request, reply) => {
  const userId = request.user?._id;
  const userEmail = request.user?.email?.toLowerCase();

  const orders = await Order.find({
    $or: [
      ...(userId ? [{ user: userId }] : []),
      ...(userEmail ? [{ guestEmail: userEmail }, { 'shippingAddress.email': userEmail }] : [])
    ]
  }).sort({ createdAt: -1 });

  const normalized = orders.map(normalizeOrder);

  reply.send({
    success: true,
    count: normalized.length,
    items: normalized,
    data: { orders: normalized, items: normalized }
  });
};

const getOrderByNumber = async (request, reply) => {
  const { orderNumber } = request.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderNumber);

  const order = await Order.findOne({
    $or: [
      { orderNumber },
      ...(isObjectId ? [{ _id: orderNumber }] : [])
    ]
  });

  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  // Object-Level Authorization (BOLA/IDOR protection)
  const isStaff = request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  if (!isStaff) {
    const isOwner = request.user && order.user && order.user.toString() === request.user._id.toString();
    const guestEmailParam = (request.query?.email || '').trim().toLowerCase();
    const guestPhoneParam = (request.query?.phone || '').trim().replace(/[\s\-\(\)]/g, '');
    const orderPhone = (order.shippingAddress?.phone || '').trim().replace(/[\s\-\(\)]/g, '');

    const matchesEmail = guestEmailParam && (
      (order.guestEmail && order.guestEmail.toLowerCase() === guestEmailParam) ||
      (order.shippingAddress?.email && order.shippingAddress.email.toLowerCase() === guestEmailParam)
    );
    const matchesPhone = guestPhoneParam && orderPhone && orderPhone === guestPhoneParam;

    if (!isOwner && !matchesEmail && !matchesPhone) {
      if (order.user) {
        throw new CustomError('Access denied: You must be logged in as the order owner to view order details.', 403, 'FORBIDDEN');
      }
      throw new CustomError('Verification required: Please provide the contact email used at checkout to access full order details.', 403, 'VERIFICATION_REQUIRED');
    }
  }

  const history = await OrderStatusHistory.find({ order: order._id }).sort({ createdAt: 1 });
  const normalized = normalizeOrder(order);

  reply.send({
    success: true,
    order: normalized,
    data: { order: normalized, history }
  });
};

const trackOrderByRef = async (request, reply) => {
  const { orderNumber } = request.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderNumber);

  const order = await Order.findOne({
    $or: [
      { orderNumber },
      ...(isObjectId ? [{ _id: orderNumber }] : [])
    ]
  });

  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  const normalized = normalizeOrder(order);

  // Return a safe tracking view that strips private customer PII (credit cards, phone, email, full address)
  const safeTrackingOrder = {
    id: normalized.id,
    ref: normalized.ref,
    orderNumber: normalized.orderNumber,
    placedAt: normalized.placedAt,
    createdAt: normalized.createdAt,
    status: normalized.status,
    orderStatus: normalized.orderStatus,
    shipping: normalized.shipping,
    destination: {
      suburb: normalized.address?.suburb || 'VIC',
      state: normalized.address?.state || 'VIC',
      postcode: normalized.address?.postcode || ''
    },
    items: (normalized.items || []).map((i) => ({
      name: i.name,
      qty: i.qty || i.quantity || 1,
      sku: i.sku || ''
    }))
  };

  reply.send({
    success: true,
    order: safeTrackingOrder,
    data: { order: safeTrackingOrder }
  });
};

const adminGetOrders = async (request, reply) => {
  const isStaff = request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  if (!isStaff) {
    throw new CustomError('Staff authorization required to view orders index', 403, 'FORBIDDEN');
  }

  const { status, paymentStatus, search, page = 1, limit = 100 } = request.query || {};
  const filter = {};

  if (status) filter.orderStatus = status;
  if (paymentStatus) filter['payment.status'] = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { guestEmail: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.email': { $regex: search, $options: 'i' } },
      { 'shippingAddress.companyName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      { 'items.name': { $regex: search, $options: 'i' } },
      { 'items.sku': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email companyName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const normalized = orders.map(normalizeOrder);

  reply.send({
    success: true,
    count: normalized.length,
    items: normalized,
    data: {
      orders: normalized,
      items: normalized,
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

  const normalized = normalizeOrder(order);

  reply.send({
    success: true,
    order: normalized,
    data: { order: normalized, history }
  });
};

const updateOrderStatusByRef = async (request, reply) => {
  const isStaff = request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  if (!isStaff) {
    throw new CustomError('Staff authorization required to modify order status', 403, 'FORBIDDEN');
  }

  const ref = request.params.orderNumber || request.params.id;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(ref);

  const order = await Order.findOne({
    $or: [
      { orderNumber: ref },
      ...(isObjectId ? [{ _id: ref }] : [])
    ]
  });

  if (!order) throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');

  const { status, note, trackingNumber, carrier, consignmentId } = request.body || {};

  if (status) order.orderStatus = status;
  if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
  if (carrier) order.shipping.carrier = carrier;
  if (consignmentId) order.shipping.consignmentId = consignmentId;

  const st = String(status || '').toLowerCase();
  if (st.includes('dispatch') || st.includes('transit') || st.includes('courier')) {
    order.shipping.status = 'DISPATCHED';
    if (!order.shipping.dispatchedAt) order.shipping.dispatchedAt = new Date();
  } else if (st.includes('deliver')) {
    order.shipping.status = 'DELIVERED';
    if (!order.shipping.deliveredAt) order.shipping.deliveredAt = new Date();
  }

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    comment: note || `Order status updated to ${order.orderStatus}`,
    updatedBy: request.user?._id
  });

  socketService.broadcast('ORDER_STATUS_CHANGED', {
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    trackingNumber: order.shipping.trackingNumber
  });

  const normalized = normalizeOrder(order);

  reply.send({
    success: true,
    message: 'Order status updated successfully',
    order: normalized,
    data: { order: normalized }
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  trackOrderByRef,
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus: updateOrderStatusByRef,
  updateOrderStatusByRef,
  normalizeOrder
};
