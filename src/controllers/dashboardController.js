const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');

const getDashboardStats = async (request, reply) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const pendingOrders = await Order.countDocuments({
    orderStatus: { $in: ['PENDING_PAYMENT', 'Pending payment', 'PROCESSING', 'PARTS_ALLOCATED'] }
  });
  const totalCustomers = await User.countDocuments();
  const tradeCustomers = await User.countDocuments({ isTradeApproved: true });
  const openQuotes = await Enquiry.countDocuments({
    status: { $in: ['NEW', 'New', 'IN_REVIEW'] }
  });
  const lowStockProducts = await Product.countDocuments({
    status: 'PUBLISHED',
    $expr: { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] }
  });

  // Revenue aggregations across all non-cancelled orders
  const revenueResult = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$pricing.grandTotal' } } }
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // Recent 10 orders
  const recentOrders = await Order.find()
    .populate('user', 'firstName lastName email companyName')
    .sort({ createdAt: -1 })
    .limit(10);

  const normalizedRecentOrders = recentOrders.map((o) => ({
    id: o.orderNumber || String(o._id),
    ref: o.orderNumber || String(o._id),
    address: {
      name: o.shippingAddress?.fullName || o.shippingAddress?.name || (o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : '')
    },
    email: o.shippingAddress?.email || o.guestEmail || o.user?.email || '',
    status: o.orderStatus || 'Packed in Campbellfield VIC',
    total: o.pricing?.grandTotal || 0,
    placedAt: o.createdAt || new Date().toISOString()
  }));

  // Recent 5 quotes
  const recentQuotes = await Enquiry.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const stats = {
    revenue: Math.round(totalRevenue * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    orders: totalOrders,
    totalOrders,
    products: totalProducts,
    totalProducts,
    customers: totalCustomers,
    totalCustomers,
    newEnquiries: openQuotes,
    openQuotes,
    pendingOrders,
    tradeCustomers,
    lowStockProducts
  };

  reply.send({
    success: true,
    stats,
    recentOrders: normalizedRecentOrders,
    data: {
      stats,
      recentOrders: normalizedRecentOrders,
      recentQuotes
    }
  });
};

module.exports = {
  getDashboardStats
};
