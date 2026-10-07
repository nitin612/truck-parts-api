const jwt = require('jsonwebtoken');

const generateTokens = (id, role = 'CUSTOMER') => {
  const accessToken = jwt.sign(
    { id, role },
    process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_truck_parts_2026',
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id, role },
    process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_truck_parts_2026',
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh
    ? (process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_truck_parts_2026')
    : (process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_truck_parts_2026');
  return jwt.verify(token, secret);
};

module.exports = {
  generateTokens,
  verifyToken
};
