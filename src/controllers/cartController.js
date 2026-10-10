const crypto = require('crypto');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');

const getCartOwnerQuery = (request) => {
  const userId = request.user?._id;
  const headerSession = request.headers['x-session-id'];
  const cookieSession = request.cookies?.cart_session_id;
  const bodySession = request.body?.sessionId;
  const querySession = request.query?.sessionId;
  const sessionId = headerSession || cookieSession || bodySession || querySession || null;

  return { userId, sessionId };
};

const resolveCart = async (request, reply) => {
  const { userId, sessionId: rawSessionId } = getCartOwnerQuery(request);

  if (userId) {
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = await Cart.create({ user: userId, items: [] });
    }

    // Merge guest cart if a sessionId was provided
    if (rawSessionId) {
      const guestCart = await Cart.findOne({ sessionId: rawSessionId });
      if (guestCart && guestCart.items?.length > 0) {
        for (const gItem of guestCart.items) {
          const existingIdx = userCart.items.findIndex(
            (i) => i.product.toString() === gItem.product.toString()
          );
          const fitment = (gItem.selectedFitment && typeof gItem.selectedFitment === 'object')
            ? gItem.selectedFitment
            : null;
          if (existingIdx > -1) {
            userCart.items[existingIdx].quantity += gItem.quantity;
            if (fitment) userCart.items[existingIdx].selectedFitment = fitment;
          } else {
            userCart.items.push({
              product: gItem.product,
              quantity: gItem.quantity,
              priceSnapshot: gItem.priceSnapshot || 0,
              coreDepositSnapshot: gItem.coreDepositSnapshot || 0,
              weightKgSnapshot: gItem.weightKgSnapshot || 1.0,
              selectedFitment: fitment
            });
          }
        }
        await userCart.save();
        await Cart.deleteOne({ _id: guestCart._id }).catch(() => {});
      }
    }

    return { cart: userCart, sessionId: null };
  }

  // Guest user
  const sessionId = rawSessionId || 'cs_' + crypto.randomBytes(16).toString('hex');
  if (!rawSessionId && reply && reply.setCookie) {
    try {
      reply.setCookie('cart_session_id', sessionId, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60
      });
    } catch { /* ignore */ }
  }

  let guestCart = await Cart.findOne({ sessionId });
  if (!guestCart) {
    guestCart = await Cart.create({ sessionId, items: [] });
  }

  return { cart: guestCart, sessionId };
};

const getCart = async (request, reply) => {
  const { cart: targetCart, sessionId } = await resolveCart(request, reply);

  let cart = await Cart.findById(targetCart._id).populate(
    'items.product',
    'name sku oemPartNumber images pricing coreDeposit dimensions inventory status isBuyable shortDescription badges'
  );
  if (!cart) {
    cart = targetCart;
  }

  // Recalculate totals and filter out archived/unbuyable items server-side
  let subtotal = 0;
  let totalCoreDeposit = 0;
  let totalWeightKg = 0;
  const validItems = [];

  for (const item of cart.items) {
    if (item.product && item.product.status === 'PUBLISHED' && item.product.isBuyable !== false) {
      const price = item.product.pricing?.sellingPrice || 0;
      const core = item.product.coreDeposit?.required ? (item.product.coreDeposit?.amount || 0) : 0;
      const weight = item.product.dimensions?.weightKg || 1.0;

      item.priceSnapshot = price;
      item.coreDepositSnapshot = core;
      item.weightKgSnapshot = weight;

      subtotal += price * item.quantity;
      totalCoreDeposit += core * item.quantity;
      totalWeightKg += weight * item.quantity;

      validItems.push(item);
    }
  }

  cart.items = validItems;
  cart.subtotal = Math.round(subtotal * 100) / 100;
  cart.totalCoreDeposit = Math.round(totalCoreDeposit * 100) / 100;
  cart.totalWeightKg = Math.round(totalWeightKg * 100) / 100;
  await cart.save();

  reply.send({
    success: true,
    data: {
      cart,
      sessionId
    }
  });
};

const addToCart = async (request, reply) => {
  const { productId, quantity = 1, selectedFitment } = request.body || {};
  const idOrSku = productId || request.body?.sku || request.body?.id;

  if (!idOrSku) {
    throw new CustomError('Product identifier (productId or SKU) is required', 400, 'PRODUCT_REQUIRED');
  }

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSku);
  const product = await Product.findOne({
    $or: [
      ...(isObjectId ? [{ _id: idOrSku }] : []),
      { sku: String(idOrSku).toUpperCase() },
      { slug: String(idOrSku) }
    ],
    status: 'PUBLISHED'
  });

  if (!product) throw new CustomError('Truck part not found or inactive', 404, 'PRODUCT_NOT_FOUND');
  if (product.pricing?.isPOA) {
    throw new CustomError('This part is Price on Application (POA). Please submit a Quote Request instead.', 400, 'POA_PRODUCT');
  }

  const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);
  const { cart } = await resolveCart(request, reply);

  const existingItemIndex = cart.items.findIndex(
    (i) => i.product.toString() === product._id.toString()
  );
  const newQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity + parsedQty : parsedQty;

  // Validate stock
  if (product.inventory?.trackInventory && product.inventory.stock < newQty) {
    throw new CustomError(`Insufficient stock for ${product.name}. Available: ${product.inventory.stock}`, 400, 'INSUFFICIENT_STOCK');
  }

  const price = product.pricing?.sellingPrice || 0;
  const core = product.coreDeposit?.required ? (product.coreDeposit?.amount || 0) : 0;
  const weight = product.dimensions?.weightKg || 1.0;

  const cleanFitment = (selectedFitment && typeof selectedFitment === 'object') ? selectedFitment : null;

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].priceSnapshot = price;
    cart.items[existingItemIndex].coreDepositSnapshot = core;
    cart.items[existingItemIndex].weightKgSnapshot = weight;
    if (cleanFitment) cart.items[existingItemIndex].selectedFitment = cleanFitment;
  } else {
    cart.items.push({
      product: product._id,
      quantity: parsedQty,
      priceSnapshot: price,
      coreDepositSnapshot: core,
      weightKgSnapshot: weight,
      selectedFitment: cleanFitment
    });
  }

  await cart.save();
  return getCart(request, reply);
};

const updateCartItem = async (request, reply) => {
  const { itemId } = request.params;
  const { quantity } = request.body || {};
  const parsedQty = parseInt(quantity, 10);

  const { cart } = await resolveCart(request, reply);
  if (!cart) throw new CustomError('Cart not found', 404, 'CART_NOT_FOUND');

  // Match by item._id, product ObjectId, or SKU
  let item = null;
  if (/^[0-9a-fA-F]{24}$/.test(itemId)) {
    try {
      item = cart.items.id(itemId);
    } catch {
      item = null;
    }
  }
  if (!item) {
    item = cart.items.find(
      (i) =>
        i._id?.toString() === itemId ||
        i.product?.toString() === itemId
    );
  }

  // If still not found and itemId looks like a SKU or product ID, find product
  if (!item) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(itemId);
    const prod = await Product.findOne({
      $or: [
        ...(isObjectId ? [{ _id: itemId }] : []),
        { sku: String(itemId).toUpperCase() }
      ]
    });
    if (prod) {
      item = cart.items.find((i) => i.product?.toString() === prod._id.toString());
    }
  }

  if (!item) throw new CustomError('Item not found in cart', 404, 'ITEM_NOT_FOUND');

  if (isNaN(parsedQty) || parsedQty <= 0) {
    cart.items = cart.items.filter((i) => i._id.toString() !== item._id.toString());
  } else {
    const product = await Product.findById(item.product);
    if (product && product.inventory?.trackInventory && product.inventory.stock < parsedQty) {
      throw new CustomError(`Only ${product.inventory.stock} units available in warehouse stock`, 400, 'INSUFFICIENT_STOCK');
    }
    item.quantity = parsedQty;
  }

  await cart.save();
  return getCart(request, reply);
};

const removeFromCart = async (request, reply) => {
  const { itemId } = request.params;
  const { cart } = await resolveCart(request, reply);
  if (!cart) throw new CustomError('Cart not found', 404, 'CART_NOT_FOUND');

  let targetId = itemId;
  // If itemId is a SKU, resolve product id
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(itemId);
  const prod = await Product.findOne({
    $or: [
      ...(isObjectId ? [{ _id: itemId }] : []),
      { sku: String(itemId).toUpperCase() }
    ]
  });

  cart.items = cart.items.filter((i) => {
    if (i._id.toString() === targetId) return false;
    if (i.product?.toString() === targetId) return false;
    if (prod && i.product?.toString() === prod._id.toString()) return false;
    return true;
  });

  await cart.save();
  return getCart(request, reply);
};

const clearCart = async (request, reply) => {
  const { cart } = await resolveCart(request, reply);
  if (cart) {
    cart.items = [];
    cart.subtotal = 0;
    cart.totalCoreDeposit = 0;
    cart.totalWeightKg = 0;
    await cart.save();
  }
  reply.send({ success: true, message: 'Cart cleared', data: { cart } });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
