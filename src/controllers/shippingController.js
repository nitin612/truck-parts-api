const { calculateFreightRates, trackShipment } = require('../services/shippingService');

const getShippingRates = async (request, reply) => {
  const { totalWeightKg = 5, postalCode = '2000', hasForklift = true } = request.query;

  const rates = calculateFreightRates({
    totalWeightKg: Number(totalWeightKg),
    postalCode: String(postalCode),
    hasForklift: hasForklift === 'true' || hasForklift === true
  });

  reply.send({
    success: true,
    data: { rates }
  });
};

const getTrackingInfo = async (request, reply) => {
  const { carrier, trackingNumber } = request.params;
  const tracking = trackShipment(carrier, trackingNumber);

  reply.send({
    success: true,
    data: { tracking }
  });
};

module.exports = {
  getShippingRates,
  getTrackingInfo
};
