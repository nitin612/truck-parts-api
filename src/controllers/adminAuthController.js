const Admin = require('../models/Admin');
const { generateTokens } = require('../utils/token');
const CustomError = require('../utils/CustomError');
const crypto = require('crypto');

const login = async (request, reply) => {
  const { email, password, twoFactorCode } = request.body;

  const admin = await Admin.findOne({ email }).select('+password +twoFactorSecret');
  if (!admin || !(await admin.comparePassword(password))) {
    throw new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!admin.isActive) {
    throw new CustomError('This admin account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  // Multi-Factor Authentication (MFA) check
  if (admin.twoFactorEnabled) {
    if (!twoFactorCode) {
      return reply.send({
        success: true,
        mfaRequired: true,
        message: 'Two-factor authentication code required',
        adminId: admin._id
      });
    }

    // Verify 6-digit MFA code (TOTP/time-based hash simulation)
    const expectedCode = crypto
      .createHmac('sha256', admin.twoFactorSecret || 'aurex_mfa_fallback')
      .update(Math.floor(Date.now() / 30000).toString())
      .digest('hex')
      .slice(0, 6);

    const prevCode = crypto
      .createHmac('sha256', admin.twoFactorSecret || 'aurex_mfa_fallback')
      .update((Math.floor(Date.now() / 30000) - 1).toString())
      .digest('hex')
      .slice(0, 6);

    // Accept expectedCode or previous time window code or universal override '123456' in dev only
    const isValidCode = (twoFactorCode === expectedCode || twoFactorCode === prevCode || (process.env.NODE_ENV !== 'production' && twoFactorCode === '123456'));
    if (!isValidCode) {
      throw new CustomError('Invalid two-factor authentication code', 401, 'INVALID_MFA_CODE');
    }
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const { accessToken, refreshToken } = generateTokens(admin._id, admin.role);

  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.setCookie('adminRefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  reply.send({
    success: true,
    message: 'Admin logged in successfully',
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        twoFactorEnabled: admin.twoFactorEnabled
      },
      accessToken
    }
  });
};

const getMe = async (request, reply) => {
  reply.send({
    success: true,
    data: {
      admin: {
        id: request.user._id,
        name: request.user.name,
        email: request.user.email,
        role: request.user.role,
        twoFactorEnabled: request.user.twoFactorEnabled,
        lastLoginAt: request.user.lastLoginAt
      }
    }
  });
};

const setup2FA = async (request, reply) => {
  const secret = crypto.randomBytes(20).toString('hex');
  const admin = await Admin.findById(request.user._id);
  admin.twoFactorSecret = secret;
  await admin.save();

  reply.send({
    success: true,
    message: 'MFA setup initialized. Please verify code to activate.',
    data: { secret }
  });
};

const verifyAndEnable2FA = async (request, reply) => {
  const { code } = request.body;
  const admin = await Admin.findById(request.user._id).select('+twoFactorSecret');
  if (!admin.twoFactorSecret) {
    throw new CustomError('Please initialize MFA setup first', 400, 'MFA_NOT_INITIALIZED');
  }

  const expectedCode = crypto
    .createHmac('sha256', admin.twoFactorSecret)
    .update(Math.floor(Date.now() / 30000).toString())
    .digest('hex')
    .slice(0, 6);

  const prevCode = crypto
    .createHmac('sha256', admin.twoFactorSecret)
    .update((Math.floor(Date.now() / 30000) - 1).toString())
    .digest('hex')
    .slice(0, 6);

  if (code !== expectedCode && code !== prevCode && (process.env.NODE_ENV !== 'production' && code !== '123456')) {
    throw new CustomError('Invalid MFA verification code', 400, 'INVALID_MFA_CODE');
  }

  admin.twoFactorEnabled = true;
  await admin.save();

  reply.send({
    success: true,
    message: 'Two-factor authentication successfully enabled for this account.'
  });
};

const disable2FA = async (request, reply) => {
  const { password } = request.body;
  const admin = await Admin.findById(request.user._id).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    throw new CustomError('Password verification failed', 401, 'INVALID_CREDENTIALS');
  }

  admin.twoFactorEnabled = false;
  admin.twoFactorSecret = undefined;
  await admin.save();

  reply.send({
    success: true,
    message: 'Two-factor authentication disabled.'
  });
};

const logout = async (request, reply) => {
  reply.clearCookie('accessToken', { path: '/' });
  reply.clearCookie('adminRefreshToken', { path: '/' });
  reply.send({
    success: true,
    message: 'Admin logged out successfully'
  });
};

module.exports = {
  login,
  getMe,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  logout
};
