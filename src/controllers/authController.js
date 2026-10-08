const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateTokens, verifyToken } = require('../utils/token');
const CustomError = require('../utils/CustomError');

const formatUser = (user) => {
  if (!user) return null;
  const isAdm = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.email === 'admin@aurex.com.au';
  const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : 'Trade');
  const lastName = user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : 'Member');
  const name = user.name || `${firstName} ${lastName}`.trim() || 'Trade Member';

  return {
    id: user._id,
    _id: user._id,
    firstName,
    lastName,
    name,
    email: user.email,
    phone: user.phone || '',
    companyName: user.companyName || user.company || '',
    company: user.companyName || user.company || '',
    role: user.role || (isAdm ? 'ADMIN' : 'CUSTOMER'),
    isAdmin: isAdm,
    isTradeApproved: !!user.isTradeApproved,
    tradeDiscountPercent: user.tradeDiscountPercent || (isAdm ? 25 : 0),
    creditLimit: user.creditLimit || 0,
    creditBalance: user.creditBalance || 0
  };
};

const register = async (request, reply) => {
  let { firstName, lastName, name, fullName, email, password, phone, company, companyName, abnOrTaxId, fleetTruckModels } = request.body || {};

  const full = (name || fullName || '').trim();
  if (full && (!firstName || !lastName)) {
    const parts = full.split(' ');
    firstName = parts[0] || 'Customer';
    lastName = parts.slice(1).join(' ') || 'User';
  }
  firstName = firstName || 'Customer';
  lastName = lastName || 'User';
  companyName = companyName || company || '';

  const cleanEmail = (email || '').trim().toLowerCase();
  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new CustomError('An account with this email already exists', 400, 'EMAIL_EXISTS');
  }

  const user = await User.create({
    firstName,
    lastName,
    email: cleanEmail,
    password,
    phone: phone || '',
    companyName,
    abnOrTaxId,
    role: companyName ? 'TRADE_CUSTOMER' : 'CUSTOMER',
    fleetTruckModels: fleetTruckModels || []
  });

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  const formatted = formatUser(user);
  reply.status(201).send({
    success: true,
    message: 'Account registered successfully',
    data: {
      user: formatted,
      accessToken
    },
    user: formatted,
    accessToken
  });
};

const login = async (request, reply) => {
  const { email, password } = request.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();

  let account = await User.findOne({ email: cleanEmail }).select('+password');
  if (!account) {
    account = await Admin.findOne({ email: cleanEmail }).select('+password');
  }

  if (!account || !(await account.comparePassword(password))) {
    throw new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!account.isActive) {
    throw new CustomError('Account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const { accessToken, refreshToken } = generateTokens(account._id, account.role);

  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  const formatted = formatUser(account);
  reply.send({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: formatted,
      accessToken
    },
    user: formatted,
    accessToken
  });
};

const refresh = async (request, reply) => {
  let token = request.cookies?.refreshToken || request.body?.refreshToken;
  if (!token && request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
    token = request.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new CustomError('Refresh token required', 401, 'UNAUTHORIZED');
  }

  let decoded;
  try {
    decoded = verifyToken(token, true);
  } catch (err) {
    throw new CustomError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }

  let account;
  if (['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(decoded.role)) {
    account = await Admin.findById(decoded.id);
  } else {
    account = await User.findById(decoded.id);
  }

  if (!account || !account.isActive) {
    throw new CustomError('User not found or deactivated', 401, 'UNAUTHORIZED');
  }

  const tokens = generateTokens(account._id, account.role);

  reply.setCookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  const formatted = formatUser(account);
  reply.send({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      user: formatted,
      accessToken: tokens.accessToken
    },
    user: formatted,
    accessToken: tokens.accessToken
  });
};

const getMe = async (request, reply) => {
  const formatted = formatUser(request.user);
  reply.send({
    success: true,
    data: {
      user: formatted
    },
    user: formatted
  });
};

const updateProfile = async (request, reply) => {
  const user = await User.findById(request.user._id);
  if (!user) {
    throw new CustomError('User not found', 404, 'NOT_FOUND');
  }
  const { firstName, lastName, phone, companyName, abnOrTaxId, fleetTruckModels } = request.body || {};

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (companyName) user.companyName = companyName;
  if (abnOrTaxId) user.abnOrTaxId = abnOrTaxId;
  if (Array.isArray(fleetTruckModels)) user.fleetTruckModels = fleetTruckModels;

  await user.save();

  const formatted = formatUser(user);
  reply.send({
    success: true,
    message: 'Profile updated successfully',
    data: { user: formatted },
    user: formatted
  });
};

const logout = async (request, reply) => {
  reply.clearCookie('accessToken', { path: '/' });
  reply.clearCookie('refreshToken', { path: '/' });
  reply.send({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  refresh,
  getMe,
  updateProfile,
  logout
};
