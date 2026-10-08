const jwt = require('jsonwebtoken');

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_ACCESS_SECRET environment variable is missing in production!');
    }
    return 'dev_insecure_jwt_access_secret_truck_parts_2026';
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET environment variable is missing in production!');
    }
    return 'dev_insecure_jwt_refresh_secret_truck_parts_2026';
  }
  return secret;
};

const generateTokens = (id, role = 'CUSTOMER') => {
  const accessToken = jwt.sign(
    { id, role },
    getAccessSecret(),
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id, role },
    getRefreshSecret(),
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? getRefreshSecret() : getAccessSecret();
  return jwt.verify(token, secret);
};

module.exports = {
  generateTokens,
  verifyToken,
  getAccessSecret,
  getRefreshSecret
};
