const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { getAccessSecret } = require('../utils/token');

const authenticate = async (request, reply) => {
  try {
    let token;

    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
      token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies && request.cookies.accessToken) {
      token = request.cookies.accessToken;
    }

    if (!token) {
      throw new CustomError('Not authorized to access this route. Token missing.', 401, 'UNAUTHORIZED');
    }

    const secret = getAccessSecret();
    const decoded = jwt.verify(token, secret);

    // Depending on the role, fetch the admin or customer
    if (['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(decoded.role)) {
      request.user = await Admin.findById(decoded.id);
    } else {
      request.user = await User.findById(decoded.id);
    }

    if (!request.user) {
      throw new CustomError('The user belonging to this token no longer exists.', 401, 'UNAUTHORIZED');
    }

    if (!request.user.isActive) {
      throw new CustomError('User account is deactivated. Please contact support.', 401, 'UNAUTHORIZED');
    }
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new CustomError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }
    throw new CustomError('Authentication processing error', 500, 'INTERNAL_SERVER_ERROR');
  }
};

const optionalAuth = async (request, reply) => {
  try {
    let token;
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
      token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies && request.cookies.accessToken) {
      token = request.cookies.accessToken;
    }

    if (token) {
      const secret = getAccessSecret();
      const decoded = jwt.verify(token, secret);
      if (['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(decoded.role)) {
        request.user = await Admin.findById(decoded.id);
      } else {
        request.user = await User.findById(decoded.id);
      }
    }
  } catch (err) {
    // If optional auth fails, request.user remains undefined
    request.user = undefined;
  }
};

const authorize = (...roles) => {
  return async (request, reply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new CustomError('You do not have permission to perform this action', 403, 'FORBIDDEN');
    }
  };
};

const requireStaff = async (request, reply) => {
  if (!request.user) {
    throw new CustomError('Authentication required to access this staff resource', 401, 'UNAUTHORIZED');
  }
  const staffRoles = ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'];
  if (!staffRoles.includes(request.user.role)) {
    throw new CustomError('Staff authorization required to perform this action', 403, 'FORBIDDEN');
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requireStaff
};
