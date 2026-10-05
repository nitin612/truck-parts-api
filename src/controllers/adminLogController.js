const AuditLog = require('../models/AuditLog');

const adminGetLogs = async (request, reply) => {
  const { module, action, search, page = 1, limit = 50 } = request.query;
  const filter = {};

  if (module) filter.module = module;
  if (action) filter.action = action;
  if (search) {
    filter.$or = [
      { adminName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { path: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      logs,
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
  adminGetLogs
};
