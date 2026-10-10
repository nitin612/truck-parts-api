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
const { stripSupplierCodes } = require('../utils/supplierCodes');
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
    payment: obj.payment?.method || 'Bank transfer',
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

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_RX = /^[0-9a-fA-F]{24}$/;
const MAX_LINES = 50;
const MAX_QTY = 99;

// The storefront sends its own labels, API clients send enums. Both resolve to one stored value.
const SHIPPING_METHODS = {
  'standard road': 'Standard road', standard: 'Standard road', 'standard road freight': 'Standard road', 'road freight': 'Standard road',
  'express priority': 'Express priority', express: 'Express priority', express_courier: 'Express priority', 'express freight': 'Express priority',
  'click and collect vic': 'Click and Collect VIC', 'click and collect': 'Click and Collect VIC', depot_pickup: 'Click and Collect VIC'
};
const PAYMENT_METHODS = {
  card: 'Card', credit_card_direct: 'Card',
  'bank transfer': 'Bank transfer', 'bank transfer (eft)': 'Bank transfer', direct_bank_transfer: 'Bank transfer',
  '30 day fleet terms': '30 day fleet terms', trade_account_30_days: '30 day fleet terms',
  'pay on pickup': 'Pay on pickup', cod_depot_pickup: 'Pay on pickup',
  'purchase order': 'Purchase order', purchase_order: 'Purchase order'
};
const lookup = (table, value) => table[String(value || '').trim().toLowerCase()];
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

const createOrder = async (request, reply) => {
  const user = request.user && !['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role)
    ? request.user
    : null;
  const userId = user?._id || null;
  const isGuest = !userId;

  const body = request.body || {};
  const shippingMethod = lookup(SHIPPING_METHODS, body.shippingMethod || body.shipping || 'Standard road');
  if (!shippingMethod) {
    throw new CustomError('That freight option is not available.', 400, 'SHIPPING_METHOD_UNAVAILABLE');
  }
  const isPickup = shippingMethod === 'Click and Collect VIC';

  // 1. Lines: every one must be a real, published, priced part. Prices and names always come
  //    from the catalogue; nothing the browser says about money is used.
  let rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 && userId) {
    const cart = await Cart.findOne({ user: userId });
    rawItems = (cart?.items || []).map((item) => ({ productId: item.product, quantity: item.quantity }));
  }
  if (rawItems.length === 0) throw new CustomError('Your cart is empty', 400, 'EMPTY_CART');
  if (rawItems.length > MAX_LINES) throw new CustomError(`An order can hold up to ${MAX_LINES} lines.`, 400, 'TOO_MANY_LINES');

  const lines = new Map();
  for (const raw of rawItems) {
    const qty = Number(raw?.quantity ?? raw?.qty ?? 1);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw new CustomError(`Quantity must be a whole number between 1 and ${MAX_QTY}.`, 400, 'INVALID_QUANTITY');
    }

    const sku = clean(raw?.sku, 60).toUpperCase();
    const productId = clean(raw?.productId, 24);
    let product = null;
    if (OBJECT_ID_RX.test(productId)) product = await Product.findById(productId);
    else if (sku) product = await Product.findOne({ sku });

    if (!product) {
      throw new CustomError(`Part ${sku || 'in your cart'} is no longer in the catalogue. Remove it and try again.`, 400, 'PRODUCT_NOT_FOUND');
    }
    if (product.status !== 'PUBLISHED' || product.isBuyable === false) {
      throw new CustomError(`${product.name} is not available to order online right now.`, 400, 'PRODUCT_UNAVAILABLE');
    }
    const unitPrice = Number(product.pricing?.sellingPrice);
    if (product.pricing?.isPOA || !(unitPrice > 0)) {
      throw new CustomError(`${product.name} is priced on enquiry. Send an enquiry and we will quote it.`, 400, 'POA_PRODUCT');
    }

    const key = String(product._id);
    const existing = lines.get(key);
    const quantity = (existing?.quantity || 0) + qty;
    if (quantity > MAX_QTY) {
      throw new CustomError(`Quantity must be a whole number between 1 and ${MAX_QTY}.`, 400, 'INVALID_QUANTITY');
    }
    if (product.inventory?.trackInventory && product.inventory.stock < quantity) {
      throw new CustomError(`Only ${Math.max(0, product.inventory.stock)} of ${product.name} left in stock.`, 400, 'INSUFFICIENT_STOCK');
    }

    lines.set(key, {
      product: product._id,
      name: stripSupplierCodes(product.name, [product.oem, product.oemPartNumber, ...(product.alternatePartNumbers || [])]),
      sku: product.sku,
      brandName: product.brandName,
      image: product.images?.[0]?.url || '',
      quantity,
      unitPrice,
      coreDeposit: product.coreDeposit?.required ? (product.coreDeposit.amount || 0) : 0,
      weightKg: product.dimensions?.weightKg || 1.0,
      total: Math.round(unitPrice * quantity * 100) / 100
    });
  }
  const verifiedItems = [...lines.values()];

  // 2. Who it is for and where it goes
  let rawAddr = body.address || body.shippingAddress || null;
  if (!rawAddr && body.addressId && userId && OBJECT_ID_RX.test(String(body.addressId))) {
    rawAddr = await Address.findOne({ _id: body.addressId, user: userId }).lean();
  }
  rawAddr = rawAddr && typeof rawAddr === 'object' ? rawAddr : {};

  const shippingAddress = {
    companyName: clean(rawAddr.company || rawAddr.companyName || user?.companyName, 120),
    fullName: clean(rawAddr.name || rawAddr.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}` : ''), 80),
    phone: clean(rawAddr.phone || user?.phone, 20),
    email: clean(rawAddr.email || user?.email, 120).toLowerCase(),
    addressLine1: clean(rawAddr.address || rawAddr.addressLine1, 120),
    addressLine2: clean(rawAddr.addressLine2, 120),
    suburbOrCity: clean(rawAddr.suburb || rawAddr.suburbOrCity, 60),
    state: clean(rawAddr.state, 3).toUpperCase(),
    postalCode: clean(rawAddr.postcode || rawAddr.postalCode, 4),
    country: 'Australia',
    deliveryInstructions: clean(rawAddr.notes || rawAddr.deliveryInstructions, 300),
    hasForkliftOnSite: Boolean(rawAddr.hasForkliftOnSite)
  };

  const missing = [];
  if (!shippingAddress.fullName) missing.push('name');
  if (!EMAIL_RX.test(shippingAddress.email)) missing.push('email');
  if (shippingAddress.phone.replace(/\D/g, '').length < 8) missing.push('phone');
  if (isPickup) {
    if (!shippingAddress.addressLine1) {
      Object.assign(shippingAddress, { addressLine1: 'Click and Collect', suburbOrCity: 'Campbellfield', state: 'VIC', postalCode: '3061' });
    }
  } else {
    if (!shippingAddress.addressLine1) missing.push('street address');
    if (!shippingAddress.suburbOrCity) missing.push('suburb');
    if (!shippingAddress.state) missing.push('state');
    if (!/^\d{4}$/.test(shippingAddress.postalCode)) missing.push('postcode');
  }
  if (missing.length) {
    throw new CustomError(`Please check your ${missing.join(', ')}.`, 400, 'INVALID_ADDRESS');
  }

  // 3. Promo code: must be live today, not just flagged active
  const targetCode = clean(body.promoCode || body.couponCode, 32).toUpperCase();
  let coupon = null;
  if (targetCode) {
    const now = new Date();
    coupon = await Coupon.findOne({ code: targetCode, isActive: true, startDate: { $lte: now }, endDate: { $gte: now } });
    if (!coupon || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
      throw new CustomError(`Promo code ${targetCode} is not valid any more.`, 400, 'INVALID_COUPON');
    }
  }

  // 4. Server-side totals. Freight comes from Site Settings, never from the request.
  const siteSettings = await SiteSetting.findOne();
  const tradeDiscountPercent = user?.isTradeApproved ? (user.tradeDiscountPercent || 0) : 0;
  const pricingTotals = calculateOrderTotals({
    items: verifiedItems,
    coupon,
    shippingMethod,
    destinationState: shippingAddress.state,
    tradeDiscountPercent,
    siteSettings
  });
  if (coupon && coupon.minimumOrderValue && pricingTotals.couponDiscountAmount === 0) {
    throw new CustomError(`Promo code ${targetCode} needs an order of $${coupon.minimumOrderValue} or more.`, 400, 'MIN_ORDER_UNMET');
  }

  // 5. Payment. Nothing is ever recorded as paid here: bank transfers and pickups are confirmed
  //    by staff, cards by the gateway webhook.
  const paymentMethod = lookup(PAYMENT_METHODS, body.paymentMethod || body.payment || 'Bank transfer');
  if (!paymentMethod) {
    throw new CustomError('That payment method is not available. Please choose another.', 400, 'PAYMENT_METHOD_UNAVAILABLE');
  }
  if (paymentMethod === 'Card' && !process.env.STRIPE_SECRET_KEY) {
    throw new CustomError('Card payments are not switched on yet. Please choose bank transfer or pay on pickup.', 400, 'CARD_UNAVAILABLE');
  }
  if (paymentMethod === 'Pay on pickup' && !isPickup) {
    throw new CustomError('Pay on pickup is only available with Click and Collect.', 400, 'PAYMENT_METHOD_UNAVAILABLE');
  }

  let paymentStatus = 'PENDING';
  let initialOrderStatus = 'Pending payment';
  if (paymentMethod === '30 day fleet terms') {
    if (!user?.isTradeApproved) {
      throw new CustomError('30 day terms are for approved trade accounts. Log in to your trade account or choose another payment method.', 403, 'TRADE_CREDIT_UNAPPROVED');
    }
    const newBalance = (user.creditBalance || 0) + pricingTotals.grandTotal;
    if (user.creditLimit > 0 && newBalance > user.creditLimit) {
      throw new CustomError('This order is over your available trade credit. Call us to arrange payment.', 400, 'CREDIT_LIMIT_EXCEEDED');
    }
    paymentStatus = 'AUTHORIZED';
    initialOrderStatus = 'Packed in Campbellfield VIC';
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
      method: paymentMethod,
      status: paymentStatus,
      purchaseOrderNumber: clean(body.purchaseOrderNumber, 60) || undefined
    },
    shipping: {
      shippingMethod,
      status: 'PROCESSING'
    },
    orderStatus: initialOrderStatus,
    customerNotes: clean(body.customerNotes, 500) || shippingAddress.deliveryInstructions
  });

  // Automatically save address to user's profile and default addresses
  if (userId && shippingAddress && shippingAddress.addressLine1 && shippingAddress.addressLine1 !== 'Click and Collect') {
    try {
      const Address = require('../models/Address');
      const existingAddress = await Address.findOne({
        user: userId,
        addressLine1: shippingAddress.addressLine1,
        postalCode: shippingAddress.postalCode
      });
      if (!existingAddress) {
        await Address.updateMany({ user: userId }, { isDefault: false });
        await Address.create({
          user: userId,
          companyName: shippingAddress.companyName || user?.companyName,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          suburbOrCity: shippingAddress.suburbOrCity,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'Australia',
          deliveryInstructions: shippingAddress.deliveryInstructions,
          isDefault: true
        });
      } else {
        existingAddress.isDefault = true;
        existingAddress.fullName = shippingAddress.fullName || existingAddress.fullName;
        existingAddress.phone = shippingAddress.phone || existingAddress.phone;
        existingAddress.email = shippingAddress.email || existingAddress.email;
        existingAddress.suburbOrCity = shippingAddress.suburbOrCity || existingAddress.suburbOrCity;
        existingAddress.state = shippingAddress.state || existingAddress.state;
        await Address.updateMany({ user: userId, _id: { $ne: existingAddress._id } }, { isDefault: false });
        await existingAddress.save();
      }

      if (user) {
        user.shippingAddress = shippingAddress;
        await user.save().catch(() => {});
      }
    } catch { /* noop */ }
  }

  // The order exists: only now touch credit, coupon usage and stock.
  if (paymentMethod === '30 day fleet terms') {
    user.creditBalance = (user.creditBalance || 0) + pricingTotals.grandTotal;
    await user.save();
  }
  if (coupon) {
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  }

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
    comment: `Order placed with payment method ${paymentMethod}`
  });

  // 9. Clear user's cart if authenticated (only for non-card methods; for Card, cart is cleared upon verified payment)
  if (userId && paymentMethod !== 'Card') {
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

  if (!userId) {
    return reply.send({ success: true, count: 0, items: [], data: { orders: [], items: [] } });
  }

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

const FULFILMENT_STATUSES = ['Packed in Campbellfield VIC', 'Courier booked', 'In transit', 'Delivered'];

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
  // We only pack once money has landed (or is collected at the counter), so moving an order
  // into fulfilment is also what records an outstanding payment as received.
  if (FULFILMENT_STATUSES.includes(status) && order.payment?.status === 'PENDING') {
    order.payment.status = 'PAID';
    order.payment.paidAt = new Date();
    order.payment.paidAmount = order.pricing?.grandTotal || 0;
  }
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
