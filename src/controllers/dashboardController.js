const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');

const getDashboardStats = async (request, reply) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['PENDING_PAYMENT', 'PROCESSING', 'PARTS_ALLOCATED'] } });
  const totalCustomers = await User.countDocuments();
  const tradeCustomers = await User.countDocuments({ isTradeApproved: true });
  const openQuotes = await Enquiry.countDocuments({ status: { $in: ['NEW', 'IN_REVIEW'] } });
  const lowStockProducts = await Product.countDocuments({
    status: 'PUBLISHED',
    $expr: { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] }
  });

  // Revenue aggregations
  const revenueResult = await Order.aggregate([
    { $match: { 'payment.status': { $in: ['PAID', 'AUTHORIZED'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$pricing.grandTotal' } } }
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // Recent 5 orders
  const recentOrders = await Order.find()
    .populate('user', 'firstName lastName email companyName')
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent 5 quotes
  const recentQuotes = await Enquiry.find()
    .sort({ createdAt: -1 })
    .limit(5);

  reply.send({
    success: true,
    data: {
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        pendingOrders,
        totalCustomers,
        tradeCustomers,
        openQuotes,
        lowStockProducts
      },
      recentOrders,
      recentQuotes
    }
  });
};

module.exports = {
  getDashboardStats
};
