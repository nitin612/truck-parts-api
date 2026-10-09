const SiteSetting = require('../models/SiteSetting');

const getSettings = async (request, reply) => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({});
  }
  reply.send({
    success: true,
    settings,
    data: { settings }
  });
};

const updateSettings = async (request, reply) => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create(request.body || {});
  } else {
    Object.assign(settings, request.body || {});
    await settings.save();
  }
  reply.send({
    success: true,
    message: 'Settings updated successfully',
    settings,
    data: { settings }
  });
};

module.exports = {
  getSettings,
  updateSettings
};
