import Enquiry from "../models/Enquiry.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";
import sendEmail, { enquiryAlertEmail } from "../services/email.js";

const makeRef = () => "ENQ-" + Math.floor(1000 + Math.random() * 9000);

/** POST /api/enquiries — public (contact form + POA product enquiries). */
export const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create({ ...req.body, ref: makeRef() });
  // Alert the store inbox (non-blocking; no-op if email isn't configured).
  sendEmail({ to: env.email.storeInbox, replyTo: enquiry.email, ...enquiryAlertEmail(enquiry) }).catch(() => {});
  res.status(201).json({ ok: true, ref: enquiry.ref });
});

/* ---------------- Admin ---------------- */
export const listEnquiries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const items = await Enquiry.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, items });
});

export const setEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findOneAndUpdate(
    { ref: String(req.params.ref).toUpperCase() },
    { status: req.body.status },
    { new: true }
  );
  if (!enquiry) throw ApiError.notFound("Enquiry not found.");
  res.json({ ok: true, enquiry });
});
