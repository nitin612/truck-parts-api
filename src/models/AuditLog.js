const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: String,
  adminEmail: String,
  adminRole: String,
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  description: String,
  method: String,
  path: String,
  statusCode: Number,
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
