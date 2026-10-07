const WelcomeOffer = require('../models/WelcomeOffer');
const CustomError = require('../utils/CustomError');

const getWelcomeOffer = async (request, reply) => {
  let offer = await WelcomeOffer.findOne({ isActive: true });
  if (!offer) {
    offer = await WelcomeOffer.create({
      title: 'Welcome Fleet Discount',
      description: 'Get $50 off your first commercial truck parts order over $500.',
      couponCode: 'WELCOME50',
      discountType: 'FIXED',
      discountValue: 50,
      minimumOrderValue: 500,
      isActive: true
    });
  }
  reply.send({ success: true, data: { offer } });
};

const adminUpdateWelcomeOffer = async (request, reply) => {
  let offer = await WelcomeOffer.findOne();
  if (!offer) offer = new WelcomeOffer();
  Object.assign(offer, request.body);
  await offer.save();

  reply.send({ success: true, message: 'Welcome offer updated', data: { offer } });
};

module.exports = {
  getWelcomeOffer,
  adminUpdateWelcomeOffer
};
