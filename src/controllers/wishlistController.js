const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');

const getWishlist = async (request, reply) => {
  const userId = request.user._id;
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    populate: { path: 'brand', select: 'name slug' }
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  reply.send({
    success: true,
    count: wishlist.products.length,
    data: { wishlist }
  });
};

const toggleWishlistItem = async (request, reply) => {
  const { productId } = request.body;
  const userId = request.user._id;

  const product = await Product.findById(productId);
  if (!product) throw new CustomError('Truck part not found', 404, 'PRODUCT_NOT_FOUND');

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  const index = wishlist.products.findIndex(id => id.toString() === productId);
  let added = false;

  if (index > -1) {
    wishlist.products.splice(index, 1);
  } else {
    wishlist.products.push(product._id);
    added = true;
  }

  await wishlist.save();

  reply.send({
    success: true,
    message: added ? 'Part saved to fleet wishlist' : 'Part removed from wishlist',
    data: { inWishlist: added }
  });
};

module.exports = {
  getWishlist,
  toggleWishlistItem
};
