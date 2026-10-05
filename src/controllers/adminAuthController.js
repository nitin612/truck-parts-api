const Admin = require('../models/Admin');
const { generateTokens } = require('../utils/token');
const CustomError = require('../utils/CustomError');

const login = async (request, reply) => {
  const { email, password } = request.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    throw new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!admin.isActive) {
    throw new CustomError('This admin account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const { accessToken, refreshToken } = generateTokens(admin._id, admin.role);

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
        role: admin.role
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
        lastLoginAt: request.user.lastLoginAt
      }
    }
  });
};

const logout = async (request, reply) => {
  reply.clearCookie('adminRefreshToken', { path: '/' });
  reply.send({
    success: true,
    message: 'Admin logged out successfully'
  });
};

module.exports = {
  login,
  getMe,
  logout
};
