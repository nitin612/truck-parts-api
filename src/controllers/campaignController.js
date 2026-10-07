const Campaign = require('../models/Campaign');
const CustomError = require('../utils/CustomError');

const getActiveCampaigns = async (request, reply) => {
  const campaigns = await Campaign.find({
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).sort({ sortOrder: 1 });

  reply.send({ success: true, count: campaigns.length, data: { campaigns } });
};

const adminGetCampaigns = async (request, reply) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  reply.send({ success: true, count: campaigns.length, data: { campaigns } });
};

const adminCreateCampaign = async (request, reply) => {
  const campaign = await Campaign.create(request.body);
  reply.status(201).send({ success: true, message: 'Campaign created successfully', data: { campaign } });
};

const adminUpdateCampaign = async (request, reply) => {
  const campaign = await Campaign.findByIdAndUpdate(request.params.id, request.body, { new: true });
  if (!campaign) throw new CustomError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  reply.send({ success: true, message: 'Campaign updated successfully', data: { campaign } });
};

const adminDeleteCampaign = async (request, reply) => {
  const campaign = await Campaign.findByIdAndDelete(request.params.id);
  if (!campaign) throw new CustomError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  reply.send({ success: true, message: 'Campaign deleted successfully' });
};

module.exports = {
  getActiveCampaigns,
  adminGetCampaigns,
  adminCreateCampaign,
  adminUpdateCampaign,
  adminDeleteCampaign
};
