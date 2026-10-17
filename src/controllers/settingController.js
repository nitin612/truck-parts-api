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

const resetSettings = async (request, reply) => {
  await SiteSetting.deleteMany({});
  const settings = await SiteSetting.create({
    storeName: 'Aurex Truck Parts',
    shortName: 'Aurex',
    phone: '+61 414 730 467',
    email: 'info@aurextruckparts.com.au',
    address: '77 Capital Link Drive, Campbellfield VIC 3061',
    hours: 'Mon-Fri 7:00 AM - 5:00 PM AEST',
    freeFreightOver: 1500,
    standardFee: 45,
    expressFee: 95,
    abn: 'ABN 47 670 781 254',
    announcement: 'Campbellfield VIC Warehouse Open - Trade Counters Mon-Fri 7am-5pm | Same-day dispatch Australia-wide'
  });
  reply.send({
    success: true,
    message: 'Settings reset to factory defaults',
    settings,
    data: { settings }
  });
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};

