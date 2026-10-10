const User = require('../models/User');
const Order = require('../models/Order');
const CustomError = require('../utils/CustomError');

const adminGetCustomers = async (request, reply) => {
  const { role, isTradeApproved, search, page = 1, limit = 50 } = request.query;
  const filter = {};

  if (role) filter.role = role;
  if (isTradeApproved !== undefined) filter.isTradeApproved = isTradeApproved === 'true';
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const customers = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const items = customers.map((c) => ({
    id: String(c._id),
    _id: c._id,
    name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.companyName || c.email,
    email: c.email,
    phone: c.phone || '',
    company: c.companyName || '',
    companyName: c.companyName || '',
    role: c.role,
    isTradeApproved: !!c.isTradeApproved,
    createdAt: c.createdAt || new Date().toISOString()
  }));

  reply.send({
    success: true,
    count: items.length,
    items,
    data: {
      customers: items,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const adminGetCustomerDetail = async (request, reply) => {
  const customer = await User.findById(request.params.id);
  if (!customer) throw new CustomError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });

  reply.send({
    success: true,
    data: { customer, orders }
  });
};

const adminUpdateTradeStatus = async (request, reply) => {
  const customer = await User.findById(request.params.id);
  if (!customer) throw new CustomError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  const { isTradeApproved, tradeDiscountPercent, creditLimit, role } = request.body;

  if (isTradeApproved !== undefined) customer.isTradeApproved = isTradeApproved;
  if (tradeDiscountPercent !== undefined) customer.tradeDiscountPercent = Number(tradeDiscountPercent);
  if (creditLimit !== undefined) customer.creditLimit = Number(creditLimit);
  if (role) customer.role = role;

  await customer.save();

  reply.send({
    success: true,
    message: 'Trade account status updated successfully',
    data: { customer }
  });
};

const adminToggleCustomerActive = async (request, reply) => {
  const customer = await User.findById(request.params.id);
  if (!customer) throw new CustomError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  customer.isActive = !customer.isActive;
  await customer.save();

  reply.send({
    success: true,
    message: `Customer account ${customer.isActive ? 'activated' : 'deactivated'}`,
    data: { customer }
  });
};

const adminDeleteCustomer = async (request, reply) => {
  const { id } = request.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  const customer = isObjectId ? await User.findById(id) : await User.findOne({ email: id });
  if (!customer) throw new CustomError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  await customer.deleteOne();

  reply.send({
    success: true,
    message: 'Customer account deleted successfully'
  });
};

module.exports = {
  adminGetCustomers,
  adminGetCustomerDetail,
  adminUpdateTradeStatus,
  adminToggleCustomerActive,
  adminDeleteCustomer
};
