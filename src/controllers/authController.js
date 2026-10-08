const User = require('../models/User');
const { generateTokens } = require('../utils/token');
const CustomError = require('../utils/CustomError');

const register = async (request, reply) => {
  let { firstName, lastName, name, email, password, phone, company, companyName, abnOrTaxId, fleetTruckModels } = request.body || {};

  if (name && (!firstName || !lastName)) {
    const parts = name.trim().split(' ');
    firstName = firstName || parts[0] || 'Customer';
    lastName = lastName || (parts.length > 1 ? parts.slice(1).join(' ') : 'Customer');
  }
  firstName = firstName || 'Customer';
  lastName = lastName || 'User';
  companyName = companyName || company || '';

  const existingUser = await User.findOne({ email: (email || '').toLowerCase() });
  if (existingUser) {
    throw new CustomError('An account with this email already exists', 400, 'EMAIL_EXISTS');
  }

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    companyName,
    abnOrTaxId,
    role: companyName ? 'TRADE_CUSTOMER' : 'CUSTOMER',
    fleetTruckModels: fleetTruckModels || []
  });

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.status(201).send({
    success: true,
    message: 'Account registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        role: user.role,
        isTradeApproved: user.isTradeApproved,
        tradeDiscountPercent: user.tradeDiscountPercent
      },
      accessToken
    }
  });
};

const login = async (request, reply) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new CustomError('Account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.send({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        role: user.role,
        isTradeApproved: user.isTradeApproved,
        tradeDiscountPercent: user.tradeDiscountPercent,
        creditLimit: user.creditLimit,
        creditBalance: user.creditBalance
      },
      accessToken
    }
  });
};

const getMe = async (request, reply) => {
  reply.send({
    success: true,
    data: {
      user: request.user
    }
  });
};

const updateProfile = async (request, reply) => {
  const user = await User.findById(request.user._id);
  const { firstName, lastName, phone, companyName, abnOrTaxId, fleetTruckModels } = request.body;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (companyName) user.companyName = companyName;
  if (abnOrTaxId) user.abnOrTaxId = abnOrTaxId;
  if (Array.isArray(fleetTruckModels)) user.fleetTruckModels = fleetTruckModels;

  await user.save();

  reply.send({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
};

const logout = async (request, reply) => {
  reply.clearCookie('refreshToken', { path: '/' });
  reply.send({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout
};
