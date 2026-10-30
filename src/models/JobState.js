const mongoose = require('mongoose');

// One small record per background job, keyed by name (e.g. when the storefront rebuild last fired).
const jobStateSchema = new mongoose.Schema({
  _id: { type: String },
  lastTriggeredAt: { type: Date },
  dirtyAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobState', jobStateSchema);
