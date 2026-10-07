const Cart = require('../models/Cart');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');

const getCart = async (request, reply) => {
  const userId = request.user._id;

  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name sku oemPartNumber images pricing coreDeposit dimensions inventory status isBuyable');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
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
    data: { cart }
  });
};

const addToCart = async (request, reply) => {
  const { productId, quantity = 1, selectedFitment } = request.body;
  const userId = request.user._id;

  const product = await Product.findOne({ _id: productId, status: 'PUBLISHED' });
  if (!product) throw new CustomError('Truck part not found or inactive', 404, 'PRODUCT_NOT_FOUND');
  if (product.pricing?.isPOA) {
    throw new CustomError('This part is Price on Application (POA). Please submit a Quote Request instead.', 400, 'POA_PRODUCT');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId.toString());
  const newQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity + quantity : quantity;

  // Validate stock
  if (product.inventory?.trackInventory && product.inventory.stock < newQty) {
    throw new CustomError(`Insufficient stock for ${product.name}. Available: ${product.inventory.stock}`, 400, 'INSUFFICIENT_STOCK');
  }

  const price = product.pricing?.sellingPrice || 0;
  const core = product.coreDeposit?.required ? (product.coreDeposit?.amount || 0) : 0;
  const weight = product.dimensions?.weightKg || 1.0;

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].priceSnapshot = price;
    cart.items[existingItemIndex].coreDepositSnapshot = core;
    cart.items[existingItemIndex].weightKgSnapshot = weight;
    if (selectedFitment) cart.items[existingItemIndex].selectedFitment = selectedFitment;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      priceSnapshot: price,
      coreDepositSnapshot: core,
      weightKgSnapshot: weight,
      selectedFitment
    });
  }

  await cart.save();
  return getCart(request, reply);
};

const updateCartItem = async (request, reply) => {
  const { itemId } = request.params;
  const { quantity } = request.body;
  const userId = request.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new CustomError('Cart not found', 404, 'CART_NOT_FOUND');

  const item = cart.items.id(itemId);
  if (!item) throw new CustomError('Item not found in cart', 404, 'ITEM_NOT_FOUND');

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    if (product && product.inventory?.trackInventory && product.inventory.stock < quantity) {
      throw new CustomError(`Only ${product.inventory.stock} units available in warehouse stock`, 400, 'INSUFFICIENT_STOCK');
    }
    item.quantity = quantity;
  }

  await cart.save();
  return getCart(request, reply);
};

const removeFromCart = async (request, reply) => {
  const { itemId } = request.params;
  const userId = request.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new CustomError('Cart not found', 404, 'CART_NOT_FOUND');

  cart.items = cart.items.filter(i => i._id.toString() !== itemId);
  await cart.save();

  return getCart(request, reply);
};

const clearCart = async (request, reply) => {
  const userId = request.user._id;
  await Cart.findOneAndUpdate({ user: userId }, { items: [], subtotal: 0, totalCoreDeposit: 0, totalWeightKg: 0 });
  reply.send({ success: true, message: 'Cart cleared' });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
