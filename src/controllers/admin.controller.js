import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Enquiry from "../models/Enquiry.js";
import asyncHandler from "../utils/asyncHandler.js";

/** GET /api/admin/stats — dashboard tiles. */
export const dashboardStats = asyncHandler(async (_req, res) => {
  const [orderCount, productCount, customerCount, newEnquiries, revenueAgg, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ active: true }),
    User.countDocuments({ role: "customer" }),
    Enquiry.countDocuments({ status: "New" }),
    Order.aggregate([
      { $match: { status: { $nin: ["Cancelled"] } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const byStatus = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  res.json({
    ok: true,
    stats: {
      orders: orderCount,
      products: productCount,
      customers: customerCount,
      newEnquiries,
      revenue: revenueAgg[0]?.revenue || 0,
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    },
    recentOrders,
  });
});

/** GET /api/admin/customers — list customers. */
export const listCustomers = asyncHandler(async (_req, res) => {
  const items = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
  res.json({
    ok: true,
    items: items.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      company: u.company,
      createdAt: u.createdAt,
    })),
  });
});
