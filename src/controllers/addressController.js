const Address = require('../models/Address');
const CustomError = require('../utils/CustomError');

const getAddresses = async (request, reply) => {
  const addresses = await Address.find({ user: request.user._id }).sort({ isDefault: -1, createdAt: -1 });
  reply.send({ success: true, count: addresses.length, data: { addresses } });
};

const createAddress = async (request, reply) => {
  const addressData = request.body;
  const userId = request.user._id;

  if (addressData.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  } else {
    const count = await Address.countDocuments({ user: userId });
    if (count === 0) addressData.isDefault = true;
  }

  const address = await Address.create({ ...addressData, user: userId });
  reply.status(201).send({ success: true, message: 'Delivery address created successfully', data: { address } });
};

const updateAddress = async (request, reply) => {
  const address = await Address.findOne({ _id: request.params.id, user: request.user._id });
  if (!address) throw new CustomError('Address not found', 404, 'ADDRESS_NOT_FOUND');

  if (request.body.isDefault) {
    await Address.updateMany({ user: request.user._id }, { isDefault: false });
  }

  Object.assign(address, request.body);
  await address.save();

  reply.send({ success: true, message: 'Address updated successfully', data: { address } });
};

const deleteAddress = async (request, reply) => {
  const address = await Address.findOne({ _id: request.params.id, user: request.user._id });
  if (!address) throw new CustomError('Address not found', 404, 'ADDRESS_NOT_FOUND');

  await address.deleteOne();
  reply.send({ success: true, message: 'Address deleted successfully' });
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
