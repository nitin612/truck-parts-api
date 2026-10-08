const Enquiry = require('../models/Enquiry');
const CustomError = require('../utils/CustomError');
const socketService = require('../services/socketService');
const { sendQuoteResponseEmail } = require('../services/notificationService');
const { uploadImage } = require('../services/cloudinaryService');
const fs = require('fs');

const generateEnquiryNumber = () => {
  return 'RFQ-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
};

const createEnquiry = async (request, reply) => {
  const data = request.body || {};
  const userId = request.user?._id;

  // Parse JSON if multipart
  ['truckDetails', 'partDetails'].forEach(field => {
    if (typeof data[field] === 'string') {
      try { data[field] = JSON.parse(data[field]); } catch (e) {}
    }
  });

  const attachments = [];
  if (request.files && request.files.length > 0) {
    for (const file of request.files) {
      const uploaded = await uploadImage(file.path, 'truck-parts/enquiries');
      attachments.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        title: file.originalname
      });
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
  }

  const enquiry = await Enquiry.create({
    enquiryNumber: generateEnquiryNumber(),
    user: userId || undefined,
    customerName: data.customerName || data.name || 'Customer',
    name: data.name || data.customerName || 'Customer',
    topic: data.topic || 'General Enquiry',
    companyName: data.companyName || '',
    email: data.email,
    phone: data.phone,
    truckDetails: data.truckDetails || {},
    partDetails: data.partDetails || (data.topic ? { partName: data.topic } : {}),
    message: data.message || '',
    attachments
  });

  // Realtime WebSocket broadcast to admin dashboard
  socketService.broadcast('NEW_QUOTE_ENQUIRY', {
    enquiryNumber: enquiry.enquiryNumber,
    customerName: enquiry.customerName,
    companyName: enquiry.companyName,
    urgency: enquiry.partDetails?.urgency || 'STANDARD',
    createdAt: enquiry.createdAt
  });

  reply.status(201).send({
    success: true,
    message: 'Part quote request submitted successfully. Our technical team will review and respond promptly.',
    data: { enquiry }
  });
};

const getCustomerEnquiries = async (request, reply) => {
  const enquiries = await Enquiry.find({ user: request.user._id })
    .populate('partDetails.product', 'name sku pricing images')
    .sort({ createdAt: -1 });

  reply.send({
    success: true,
    count: enquiries.length,
    data: { enquiries }
  });
};

const getEnquiryByNumber = async (request, reply) => {
  const { enquiryNumber } = request.params;
  const { email, phone } = request.query || {};

  const enquiry = await Enquiry.findOne({ enquiryNumber })
    .populate('partDetails.product', 'name sku pricing images');

  if (!enquiry) throw new CustomError('Quote request not found', 404, 'ENQUIRY_NOT_FOUND');

  // 1. Authorize admin/staff roles
  const isAdmin = request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  if (isAdmin) {
    return reply.send({ success: true, data: { enquiry } });
  }

  // 2. Authorize registered account owner
  const isOwner = request.user && enquiry.user && enquiry.user.toString() === request.user._id.toString();
  if (isOwner) {
    return reply.send({ success: true, data: { enquiry } });
  }

  // 3. Registered user enquiry cannot be accessed by unauthenticated or unrelated users
  if (enquiry.user) {
    if (!request.user) {
      throw new CustomError('Authentication required to access this quote request', 401, 'AUTH_REQUIRED');
    }
    throw new CustomError('Access denied to this quote request', 403, 'FORBIDDEN');
  }

  // 4. Guest enquiry lookup requires email or phone verification
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPhone = (phone || '').trim().replace(/[\s\-\(\)]/g, '');
  const enquiryPhone = (enquiry.phone || '').trim().replace(/[\s\-\(\)]/g, '');

  const matchesEmail = normalizedEmail && enquiry.email && enquiry.email.toLowerCase() === normalizedEmail;
  const matchesPhone = normalizedPhone && enquiryPhone && enquiryPhone === normalizedPhone;

  if (!matchesEmail && !matchesPhone) {
    throw new CustomError('Verification required to view quote details. Please provide the contact email or phone number used when submitting.', 403, 'VERIFICATION_REQUIRED');
  }

  reply.send({
    success: true,
    data: { enquiry }
  });
};

const adminGetEnquiries = async (request, reply) => {
  const { status, urgency, page = 1, limit = 50 } = request.query;
  const filter = {};

  if (status) filter.status = status;
  if (urgency) filter['partDetails.urgency'] = urgency;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Enquiry.countDocuments(filter);
  const enquiries = await Enquiry.find(filter)
    .populate('user', 'firstName lastName email companyName isTradeApproved')
    .populate('partDetails.product', 'name sku pricing')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      enquiries,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const adminRespondEnquiry = async (request, reply) => {
  const enquiry = await Enquiry.findById(request.params.id);
  if (!enquiry) throw new CustomError('Quote request not found', 404, 'ENQUIRY_NOT_FOUND');

  const { status, adminNotes, quotedPrice, quotedAvailability } = request.body;

  if (status) enquiry.status = status;
  if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
  if (quotedPrice !== undefined) enquiry.quotedPrice = Number(quotedPrice);
  if (quotedAvailability !== undefined) enquiry.quotedAvailability = quotedAvailability;

  enquiry.respondedBy = request.user._id;
  enquiry.respondedAt = new Date();

  await enquiry.save();

  // Send email to customer if quote is provided
  if (status === 'QUOTE_SENT' || quotedPrice > 0) {
    sendQuoteResponseEmail(enquiry).catch(err => console.error('Quote email error:', err));
  }

  reply.send({
    success: true,
    message: 'Quote response updated and sent to customer',
    data: { enquiry }
  });
};

module.exports = {
  createEnquiry,
  getCustomerEnquiries,
  getEnquiryByNumber,
  adminGetEnquiries,
  adminRespondEnquiry
};
