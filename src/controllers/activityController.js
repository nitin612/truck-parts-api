const UserActivity = require('../models/UserActivity');

const trackActivity = async (request, reply) => {
  const { action, sessionId, metadata } = request.body;
  const userId = request.user?._id;

  const ip = request.headers['x-forwarded-for'] || request.ip || '127.0.0.1';
  const userAgent = request.headers['user-agent'] || '';

  await UserActivity.create({
    user: userId || undefined,
    sessionId,
    ipAddress: ip,
    userAgent,
    action,
    metadata
  });

  reply.send({ success: true });
};

const adminGetActivities = async (request, reply) => {
  const { action, page = 1, limit = 50 } = request.query;
  const filter = {};
  if (action) filter.action = action;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await UserActivity.countDocuments(filter);
  const activities = await UserActivity.find(filter)
    .populate('user', 'firstName lastName email companyName')
    .populate('metadata.productId', 'name sku pricing')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      activities,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

module.exports = {
  trackActivity,
  adminGetActivities
};
