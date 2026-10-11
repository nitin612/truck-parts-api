const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');
const CustomError = require('../utils/CustomError');
const socketService = require('../services/socketService');
const { sendQuoteResponseEmail } = require('../services/notificationService');
const { uploadImage } = require('../services/cloudinaryService');
const fs = require('fs');

const generateEnquiryNumber = () => {
  return 'RFQ-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
};

const generateTailLiftEnquiryNumber = () => {
  return 'TL-RFQ-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
};

const createTailLiftEnquiry = async (request, reply) => {
  const data = request.body || {};
  const userId = request.user?._id;

  // Parse nested objects if sent as multipart strings or nested JSON
  ['truckDetails', 'partDetails', 'tailLiftDetails', 'options'].forEach((field) => {
    if (typeof data[field] === 'string') {
      try { data[field] = JSON.parse(data[field]); } catch (e) {}
    }
  });

  const name = (data.name || data.customerName || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const phone = (data.phone || '').trim();
  const companyName = (data.companyName || data.company || '').trim();
  const state = (data.state || data.location || 'VIC').trim();
  const preferredContact = (data.preferredContact || 'Phone Call').trim();

  if (!name || name.length < 2) {
    throw new CustomError('Full customer name is required', 400, 'NAME_REQUIRED');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CustomError('A valid email address is required', 400, 'INVALID_EMAIL');
  }
  if (!phone || phone.length < 6) {
    throw new CustomError('A valid contact phone number is required', 400, 'PHONE_REQUIRED');
  }

  // Identify SKU and find Product if possible
  const sku = (data.sku || data.selectedSku || data.partDetails?.sku || '').trim().toUpperCase();
  const productId = data.productId || data.partDetails?.product;
  let product = null;

  if (productId && /^[0-9a-fA-F]{24}$/.test(String(productId))) {
    product = await Product.findById(productId);
  } else if (sku) {
    product = await Product.findOne({ sku });
  }

  // Tail lift engineering specifications
  const vehicleMakeModel = (
    data.vehicleMakeModel ||
    data.truckDetails?.makeModel ||
    data.truckDetails?.model ||
    ''
  ).trim();

  const bodyType = data.bodyType || data.truckDetails?.bodyType || 'Pantech / Dry Freight Box';
  const voltage = data.voltage || data.truckDetails?.voltage || '24V DC (Standard Heavy Truck)';
  const bedHeight = data.bedHeight || data.truckDetails?.bedHeight || '';
  const bodyWidth = data.bodyWidth || data.truckDetails?.bodyWidth || '2450 mm';

  const liftCapacity = data.liftCapacity || data.partDetails?.capacity || (product?.specs?.Capacity || '2000 kg');
  const platformMaterial = data.platformMaterial || data.partDetails?.material || (product?.specs?.Material || 'Aluminium');
  const platformHeight = data.platformHeight || data.partDetails?.platformHeight || '2400 mm';
  const serviceType = data.serviceType || data.partDetails?.serviceType || 'Supply Only (Freighted to Workshop)';
  const options = data.options || data.tailLiftDetails?.options || {};
  const vinOrNotes = (data.vinOrNotes || data.vin || data.notes || data.message || '').trim();

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

  // Format options list for clear human-readable review
  let selectedOptionsList = '';
  if (options && typeof options === 'object') {
    const labels = {
      footControls: 'Platform Foot Controls',
      rollStops: 'Roll-Stop Cart Barriers',
      flashingLights: 'Corner Flashing LED Safety Lights',
      remotePendant: 'Handheld Remote Pendant',
      bumperBar: 'Rear Underrun Bumper Bar'
    };
    selectedOptionsList = Object.entries(options)
      .filter(([, v]) => v)
      .map(([k]) => labels[k] || k)
      .join(', ');
  }

  const compiledMessage = (data.message && data.message.includes('[TAIL LIFT ENGINEERING ENQUIRY]'))
    ? data.message
    : `
[TAIL LIFT ENGINEERING ENQUIRY]
Selected Model: ${product ? product.name : (data.selectedModel || 'Tail Lift')} (SKU: ${product?.sku || sku || 'Custom Unit'})
Capacity: ${liftCapacity} | Platform Material: ${platformMaterial} | Platform Height: ${platformHeight}
Company: ${companyName || 'Not specified'} | Location: ${state} | Preferred Contact: ${preferredContact}
Vehicle Make/Model: ${vehicleMakeModel || 'Not specified'}
Body Type: ${bodyType} | Voltage: ${voltage}
Bed Height: ${bedHeight || 'Not specified'} | Body Width: ${bodyWidth}
Selected Options: ${selectedOptionsList || 'Standard configuration'}
Service: ${serviceType}
Notes / VIN: ${vinOrNotes || 'None provided'}
    `.trim();

  const tailLiftDetails = {
    selectedModel: product ? product.name : (data.selectedModel || 'Tail Lift'),
    vehicleMakeModel,
    bodyType,
    voltage,
    bedHeight,
    bodyWidth,
    liftCapacity,
    platformMaterial,
    platformHeight,
    options,
    serviceType,
    vinOrNotes
  };

  const truckDetails = {
    makeModel: vehicleMakeModel,
    bodyType,
    voltage,
    bedHeight,
    bodyWidth,
    vinOrChassis: vinOrNotes.match(/VIN[:\s]+([A-HJ-NPR-Z0-9]{17})/i)?.[1] || undefined
  };

  const partDetails = {
    product: product?._id || undefined,
    partName: product ? product.name : 'Commercial Hydraulic Tail Lift',
    sku: product?.sku || sku,
    oemPartNumber: product?.oemPartNumber || product?.oem || sku,
    capacity: liftCapacity,
    material: platformMaterial,
    platformHeight,
    serviceType,
    quantity: data.quantity ? Number(data.quantity) : 1,
    urgency: data.urgency || 'HIGH'
  };

  const enquiry = await Enquiry.create({
    enquiryNumber: generateTailLiftEnquiryNumber(),
    enquiryType: 'TAIL_LIFT',
    user: userId || undefined,
    customerName: name,
    name,
    sku: product?.sku || sku,
    topic: `Tail Lift Enquiry - ${product?.sku || sku || 'Custom Unit'}`,
    companyName,
    email,
    phone,
    state,
    preferredContact,
    tailLiftDetails,
    truckDetails,
    partDetails,
    message: compiledMessage,
    attachments,
    status: 'New'
  });

  // Realtime WebSocket broadcast to admin dashboard
  socketService.broadcast('NEW_QUOTE_ENQUIRY', {
    enquiryNumber: enquiry.enquiryNumber,
    enquiryType: 'TAIL_LIFT',
    customerName: enquiry.customerName,
    companyName: enquiry.companyName,
    sku: enquiry.sku,
    urgency: 'HIGH',
    createdAt: enquiry.createdAt
  });

  const normalized = normalizeEnquiry(enquiry);

  reply.status(201).send({
    success: true,
    message: 'Tail lift quote request submitted successfully. Our engineering team will review your specifications and contact you promptly.',
    ref: enquiry.enquiryNumber,
    enquiryNumber: enquiry.enquiryNumber,
    data: {
      enquiryNumber: enquiry.enquiryNumber,
      ref: enquiry.enquiryNumber,
      enquiry: normalized
    },
    enquiry: normalized
  });
};

const createEnquiry = async (request, reply) => {
  const data = request.body || {};

  // If this is identified as a tail-lift enquiry, route to tail-lift handler
  const isTailLift =
    data.enquiryType === 'TAIL_LIFT' ||
    data.isTailLift === true ||
    (data.sku && /^ATP-TL/i.test(data.sku)) ||
    (data.topic && /tail\s*lift/i.test(data.topic));

  if (isTailLift) {
    return createTailLiftEnquiry(request, reply);
  }

  const userId = request.user?._id;

  // Parse JSON if multipart
  ['truckDetails', 'partDetails', 'tailLiftDetails', 'options'].forEach(field => {
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
    enquiryType: data.enquiryType || 'GENERAL',
    user: userId || undefined,
    customerName: data.customerName || data.name || 'Customer',
    name: data.name || data.customerName || 'Customer',
    sku: data.sku || data.partDetails?.sku || '',
    topic: data.topic || 'General Enquiry',
    companyName: data.companyName || '',
    email: data.email,
    phone: data.phone,
    state: data.state || '',
    preferredContact: data.preferredContact || '',
    truckDetails: data.truckDetails || {},
    partDetails: data.partDetails || (data.topic ? { partName: data.topic } : {}),
    tailLiftDetails: data.tailLiftDetails || undefined,
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

  const normalized = normalizeEnquiry(enquiry);

  reply.status(201).send({
    success: true,
    message: 'Part quote request submitted successfully. Our technical team will review and respond promptly.',
    ref: enquiry.enquiryNumber,
    enquiryNumber: enquiry.enquiryNumber,
    data: {
      enquiryNumber: enquiry.enquiryNumber,
      ref: enquiry.enquiryNumber,
      enquiry: normalized
    },
    enquiry: normalized
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

const normalizeEnquiry = (e) => {
  if (!e) return e;
  const obj = e.toObject ? e.toObject() : e;
  const num = obj.enquiryNumber || (obj._id ? String(obj._id) : 'ENQ-UNKNOWN');
  const isTailLift = obj.enquiryType === 'TAIL_LIFT' || (obj.sku && /^ATP-TL/i.test(obj.sku));
  return {
    ...obj,
    id: num,
    ref: num,
    enquiryNumber: num,
    enquiryType: obj.enquiryType || (isTailLift ? 'TAIL_LIFT' : 'GENERAL'),
    name: obj.name || obj.customerName || 'Customer',
    customerName: obj.customerName || obj.name || 'Customer',
    companyName: obj.companyName || '',
    email: obj.email || '',
    phone: obj.phone || '',
    state: obj.state || obj.tailLiftDetails?.state || '',
    preferredContact: obj.preferredContact || obj.tailLiftDetails?.preferredContact || '',
    topic: obj.topic || obj.partDetails?.partName || 'General Enquiry',
    sku: obj.sku || obj.partDetails?.sku || obj.partDetails?.oemPartNumber || obj.partDetails?.product?.sku || '',
    message: obj.message || '',
    tailLiftDetails: obj.tailLiftDetails || null,
    truckDetails: obj.truckDetails || {},
    partDetails: obj.partDetails || {},
    status: obj.status || 'New',
    createdAt: obj.createdAt || new Date().toISOString()
  };
};

const adminGetEnquiries = async (request, reply) => {
  const isStaff = request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  if (!isStaff) {
    throw new CustomError('Staff authorization required to view quote requests', 403, 'FORBIDDEN');
  }

  const { status, urgency, type, enquiryType, page = 1, limit = 100 } = request.query || {};
  const filter = {};

  if (status) filter.status = status;
  if (urgency) filter['partDetails.urgency'] = urgency;
  if (type || enquiryType) filter.enquiryType = (type || enquiryType).toUpperCase();

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Enquiry.countDocuments(filter);
  const enquiries = await Enquiry.find(filter)
    .populate('user', 'firstName lastName email companyName isTradeApproved')
    .populate('partDetails.product', 'name sku pricing')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const items = enquiries.map(normalizeEnquiry);

  reply.send({
    success: true,
    count: items.length,
    items,
    data: {
      enquiries: items,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const updateEnquiryStatusByRef = async (request, reply) => {
  const isStaff = request.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_REP', 'WAREHOUSE_MANAGER'].includes(request.user.role);
  if (!isStaff) {
    throw new CustomError('Staff authorization required to modify quote requests', 403, 'FORBIDDEN');
  }

  const ref = request.params.enquiryNumber || request.params.id || request.params.ref;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(ref);

  const enquiry = await Enquiry.findOne({
    $or: [
      { enquiryNumber: ref },
      ...(isObjectId ? [{ _id: ref }] : [])
    ]
  });

  if (!enquiry) throw new CustomError('Quote request not found', 404, 'ENQUIRY_NOT_FOUND');

  const { status, adminNotes, quotedPrice, quotedAvailability } = request.body || {};

  if (status) enquiry.status = status;
  if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
  if (quotedPrice !== undefined) enquiry.quotedPrice = Number(quotedPrice);
  if (quotedAvailability !== undefined) enquiry.quotedAvailability = quotedAvailability;

  if (request.user?._id) enquiry.respondedBy = request.user._id;
  enquiry.respondedAt = new Date();

  await enquiry.save();

  if (status === 'QUOTE_SENT' || quotedPrice > 0) {
    sendQuoteResponseEmail(enquiry).catch((err) => console.error('Quote email error:', err));
  }

  const normalized = normalizeEnquiry(enquiry);

  reply.send({
    success: true,
    message: 'Enquiry updated successfully',
    enquiry: normalized,
    data: { enquiry: normalized }
  });
};

const adminRespondEnquiry = updateEnquiryStatusByRef;

module.exports = {
  createEnquiry,
  createTailLiftEnquiry,
  getCustomerEnquiries,
  getEnquiryByNumber,
  adminGetEnquiries,
  adminRespondEnquiry,
  updateEnquiryStatusByRef,
  normalizeEnquiry
};
