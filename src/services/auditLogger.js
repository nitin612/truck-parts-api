const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({
  admin,
  action,
  module,
  description,
  method,
  path,
  statusCode,
  ipAddress,
  userAgent,
  details
}) => {
  try {
    if (!admin) return;

    // Redact sensitive keys from details if present
    const cleanDetails = details ? { ...details } : {};
    delete cleanDetails.password;
    delete cleanDetails.newPassword;

    await AuditLog.create({
      admin: admin._id || admin.id,
      adminName: admin.name || 'Admin',
      adminEmail: admin.email || 'admin@truckparts.com',
      adminRole: admin.role || 'ADMIN',
      action,
      module,
      description,
      method,
      path,
      statusCode,
      ipAddress,
      userAgent,
      details: cleanDetails
    });
  } catch (err) {
    console.error('AuditLog writing failed:', err.message);
  }
};

const inferActionAndDescription = (method, url, body) => {
  let module = 'GENERAL';
  if (url.includes('/products')) module = 'PRODUCTS';
  else if (url.includes('/categories')) module = 'CATEGORIES';
  else if (url.includes('/brands')) module = 'BRANDS';
  else if (url.includes('/orders')) module = 'ORDERS';
  else if (url.includes('/enquiries')) module = 'ENQUIRIES';
  else if (url.includes('/coupons')) module = 'COUPONS';
  else if (url.includes('/campaigns')) module = 'CAMPAIGNS';
  else if (url.includes('/customers')) module = 'CUSTOMERS';
  else if (url.includes('/payments')) module = 'PAYMENT_SETTINGS';
  else if (url.includes('/shipping')) module = 'SHIPPING';
  else if (url.includes('/cms') || url.includes('/content') || url.includes('/home-sections')) module = 'CMS';
  else if (url.includes('/blogs')) module = 'BLOGS';
  else if (url.includes('/reviews')) module = 'REVIEWS';

  let action = 'UPDATE';
  if (method === 'POST') action = 'CREATE';
  else if (method === 'DELETE') action = 'DELETE';
  else if (method === 'PATCH') action = 'STATUS_UPDATE';

  const description = `${action} performed on ${module} via ${url}`;
  return { action, module, description };
};

module.exports = {
  logAdminAction,
  inferActionAndDescription
};
