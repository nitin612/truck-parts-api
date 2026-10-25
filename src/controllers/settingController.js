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
  const updateData = { ...(request.body || {}) };
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  delete updateData.__v;

  if (!settings) {
    settings = await SiteSetting.create(updateData);
  } else {
    Object.assign(settings, updateData);
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
    freeFreightOver: 200,
    standardFee: 45,
    expressFee: 95,
    abn: 'ABN 47 670 781 254',
    announcement: 'Free road freight Australia wide on orders over $200 | Order by 2pm for same-day dispatch',
    showAnnouncement: true
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

