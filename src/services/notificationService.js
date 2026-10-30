const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer SMTP transporter.
 * Returns null if SMTP credentials are not yet populated in .env (safely logs simulation).
 */
const createTransporter = () => {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASSWORD || '';
  const pass = rawPass.replace(/\s+/g, '');

  if (!host || !user || !pass) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
};

/**
 * Core sendEmail helper
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('[Email Skipped - No recipient provided]');
    return { success: false, error: 'NO_RECIPIENT' };
  }

  const transporter = createTransporter();
  const user = (process.env.SMTP_USER || '').trim();
  const from = process.env.SMTP_FROM || `"Aurex Truck Parts" <${user || 'info@aurextruckparts.com.au'}>`;
  const replyTo = process.env.STORE_SUPPORT_EMAIL || 'info@aurextruckparts.com.au';

  if (!transporter) {
    console.log(`[Email Skipped - SMTP Not Configured in .env] To: ${to} | Subject: "${subject}"`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      replyTo,
      to,
      subject,
      text: text || '',
      html
    });
    console.log(`[Email Sent] MessageId: ${info.messageId} | To: ${to} | Subject: "${subject}"`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Failed] To: ${to} | Error: ${err.message}`);
    return { success: false, error: err.message };
  }
};

const getCustomerEmail = (order) => {
  return (
    order.shippingAddress?.email ||
    order.guestEmail ||
    (order.user && typeof order.user === 'object' ? order.user.email : null) ||
    null
  );
};

// Customer-typed text (names, addresses, notes) must not turn into markup inside a store-branded email
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escFields = (obj) => {
  const plain = obj && typeof obj.toObject === 'function' ? obj.toObject() : (obj || {});
  return Object.fromEntries(Object.entries(plain).map(([k, v]) => [k, typeof v === 'string' ? esc(v) : v]));
};

const getCustomerName = (order) => {
  return esc(
    order.shippingAddress?.fullName ||
    order.shippingAddress?.companyName ||
    (order.user && typeof order.user === 'object' ? order.user.name : 'Valued Customer')
  );
};

/**
 * Standard Aurex Branded HTML Email Template
 */
const renderEmailTemplate = ({
  title,
  badgeText,
  badgeBg = '#001738',
  badgeColor = '#ffffff',
  customerName,
  orderNumber,
  statusMessage,
  order,
  tracking = null,
  showReviewCta = false
}) => {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const trackUrl = `${appUrl}/track?order=${encodeURIComponent(orderNumber)}`;
  const reviewUrl = `${appUrl}/orders?rate=${encodeURIComponent(orderNumber)}`;
  // Google Business Profile review link ("Ask for reviews" in the profile). Every delivered order gets the same
  // neutral ask: Google's rules forbid asking only customers you expect to be happy.
  const googleReviewUrl = (process.env.GOOGLE_REVIEW_URL || '').replace(/"/g, '%22');

  const items = (order.items || []).map(escFields);
  const pricing = order.pricing || { subtotal: 0, shippingFee: 0, grandTotal: 0 };
  const shipping = escFields(order.shippingAddress);

  const itemsHtml = items.map((i) => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
        <strong style="color: #111827; font-size: 14px;">${i.name}</strong>
        <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">SKU: <span style="font-family: monospace; font-weight: bold;">${i.sku}</span></div>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #111827; font-size: 14px; font-weight: bold; vertical-align: top;">
        ${i.quantity}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 14px; vertical-align: top;">
        $${Number(i.unitPrice || 0).toFixed(2)}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: bold; font-size: 14px; vertical-align: top;">
        $${Number(i.total || (i.unitPrice * i.quantity) || 0).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 24px 12px;">
        <tr>
          <td align="center">
            <!-- Email Container -->
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb;">
              
              <!-- Brand Header Bar -->
              <tr>
                <td style="background-color: #001738; padding: 24px 28px; border-bottom: 3px solid #d97706; text-align: left;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">
                          AUREX <span style="color: #f59e0b;">TRUCK PARTS</span>
                        </h1>
                        <p style="margin: 3px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          Heavy Trailer & Commercial Hardware • Melbourne VIC
                        </p>
                      </td>
                      <td align="right" style="vertical-align: middle;">
                        <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; border: 1px solid rgba(255,255,255,0.2);">
                          ${badgeText}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Body Content -->
              <tr>
                <td style="padding: 28px;">
                  <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 19px; font-weight: 800;">
                    ${title}
                  </h2>
                  <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px;">
                    Dear <strong>${customerName}</strong>,
                  </p>
                  
                  <!-- Status Message Card -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                    <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
                      ${statusMessage}
                    </p>
                  </div>

                  <!-- Tracking Details Callout (If Dispatched) -->
                  ${tracking && (tracking.trackingNumber || tracking.carrier) ? `
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
                      <h4 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        🚚 Courier Dispatch Details
                      </h4>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #1e3a8a;">
                        ${tracking.carrier ? `<tr><td style="padding: 2px 0;"><strong>Freight Carrier:</strong></td><td>${tracking.carrier}</td></tr>` : ''}
                        ${tracking.trackingNumber ? `<tr><td style="padding: 2px 0;"><strong>Tracking Number:</strong></td><td><span style="font-family: monospace; font-weight: bold; background: #dbeafe; padding: 2px 6px; border-radius: 4px;">${tracking.trackingNumber}</span></td></tr>` : ''}
                        ${tracking.consignmentId ? `<tr><td style="padding: 2px 0;"><strong>Consignment Ref:</strong></td><td>${tracking.consignmentId}</td></tr>` : ''}
                      </table>
                      <div style="margin-top: 14px;">
                        <a href="${trackUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 9px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block;">
                          Track Consignment Live →
                        </a>
                      </div>
                    </div>
                  ` : ''}

                  <!-- Delivered Review Callout (If Delivered) -->
                  ${showReviewCta ? `
                    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin-bottom: 24px; text-align: center;">
                      <h3 style="margin: 0 0 6px 0; color: #065f46; font-size: 16px; font-weight: 800;">
                        ★ How did the parts fit? Leave a quick review!
                      </h3>
                      <p style="margin: 0 0 14px 0; color: #047857; font-size: 13px;">
                        Your rating helps fleet operators and workshops across Australia make informed hardware choices.
                      </p>
                      <a href="${reviewUrl}" style="background-color: #059669; color: #ffffff; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 800; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Give Product Rating & Feedback ★★★★★
                      </a>
                      ${googleReviewUrl ? `
                      <p style="margin: 14px 0 0 0; color: #047857; font-size: 13px;">
                        You can also share your experience of Aurex on <a href="${googleReviewUrl}" style="color: #065f46; font-weight: 800;">Google</a>.
                      </p>` : ''}
                    </div>
                  ` : ''}

                  <!-- Order Meta Info Bar -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td><strong>Order Reference:</strong> #${orderNumber}</td>
                        <td align="right"><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 4px;"><strong>Payment Method:</strong> ${order.payment?.method ? order.payment.method.replace(/_/g, ' ') : 'Card'}</td>
                        <td align="right" style="padding-top: 4px;"><strong>Payment Status:</strong> <span style="font-weight: bold; color: ${order.payment?.status === 'PAID' ? '#059669' : '#d97706'};">${order.payment?.status || 'PENDING'}</span></td>
                      </tr>
                    </table>
                  </div>

                  <!-- Parts Ordered Table -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                      <tr style="background-color: #f3f4f6;">
                        <th align="left" style="padding: 10px; font-size: 12px; font-weight: 800; color: #4b5563; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Part Details</th>
                        <th align="center" style="padding: 10px; font-size: 12px; font-weight: 800; color: #4b5563; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
                        <th align="right" style="padding: 10px; font-size: 12px; font-weight: 800; color: #4b5563; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Price</th>
                        <th align="right" style="padding: 10px; font-size: 12px; font-weight: 800; color: #4b5563; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Totals Summary & Delivery Address Columns -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <!-- Delivery Address -->
                      <td width="55%" style="vertical-align: top; padding-right: 15px;">
                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; font-size: 13px; color: #4b5563; line-height: 1.5;">
                          <strong style="color: #111827; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Delivery Destination:</strong>
                          <div style="margin-top: 4px; color: #111827; font-weight: bold;">${shipping.fullName || customerName}</div>
                          ${shipping.companyName ? `<div>${shipping.companyName}</div>` : ''}
                          <div>${shipping.addressLine1 || ''}</div>
                          ${shipping.addressLine2 ? `<div>${shipping.addressLine2}</div>` : ''}
                          <div>${shipping.suburbOrCity || ''} ${shipping.state || ''} ${shipping.postalCode || ''}</div>
                          <div>Phone: ${shipping.phone || 'N/A'}</div>
                          ${shipping.deliveryInstructions ? `<div style="margin-top: 6px; font-style: italic; color: #6b7280;">Note: "${shipping.deliveryInstructions}"</div>` : ''}
                        </div>
                      </td>
                      
                      <!-- Cost Totals -->
                      <td width="45%" style="vertical-align: top;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.8;">
                          <tr>
                            <td style="color: #6b7280;">Subtotal:</td>
                            <td align="right" style="font-weight: 600; color: #111827;">$${Number(pricing.subtotal || 0).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280;">Road Freight:</td>
                            <td align="right" style="font-weight: 600; color: ${pricing.shippingFee > 0 ? '#111827' : '#059669'};">
                              ${pricing.shippingFee > 0 ? `$${Number(pricing.shippingFee).toFixed(2)}` : 'FREE'}
                            </td>
                          </tr>
                          ${pricing.totalCoreDeposit > 0 ? `
                            <tr>
                              <td style="color: #6b7280;">Core Surcharge:</td>
                              <td align="right" style="font-weight: 600; color: #111827;">$${Number(pricing.totalCoreDeposit).toFixed(2)}</td>
                            </tr>
                          ` : ''}
                          ${pricing.totalDiscount > 0 ? `
                            <tr>
                              <td style="color: #059669;">Trade Discount:</td>
                              <td align="right" style="font-weight: 600; color: #059669;">-$${Number(pricing.totalDiscount).toFixed(2)}</td>
                            </tr>
                          ` : ''}
                          <tr>
                            <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 4px;"></td>
                          </tr>
                          <tr>
                            <td style="font-size: 15px; font-weight: 800; color: #001738;">Grand Total:</td>
                            <td align="right" style="font-size: 16px; font-weight: 900; color: #001738;">$${Number(pricing.grandTotal || 0).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colspan="2" align="right" style="font-size: 11px; color: #9ca3af;">
                              (Includes $${Number(pricing.tax || (pricing.grandTotal / 11)).toFixed(2)} Australian GST)
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Helpful Support / Action Links -->
                  <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    <a href="${trackUrl}" style="background-color: #f59e0b; color: #111827; padding: 11px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block;">
                      View & Track Order Online →
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 28px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; line-height: 1.6;">
                  <strong style="color: #111827;">Aurex Truck Parts Australia</strong><br />
                  Campbellfield Distribution Depot: 77 Capital Link Drive, Campbellfield VIC 3061<br />
                  Trade Desk: +61 414 730 467 • Email: info@aurextruckparts.com.au • ABN: 47 670 781 254<br />
                  <span style="display: inline-block; margin-top: 6px; color: #9ca3af;">
                    Official Australian Tax Invoice copy accessible via your customer account order history.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * 1. ORDER PLACED (Initial order received)
 */
const sendOrderPlacedEmail = async (order) => {
  const email = getCustomerEmail(order);
  if (!email) return;

  const isBankTransfer = String(order.payment?.method || '').toLowerCase().includes('bank');

  const statusMessage = isBankTransfer
    ? `Thank you for your order! We have received order <strong>#${order.orderNumber}</strong>. Please find our commercial banking details on your invoice or transfer to Aurex Truck Parts using reference <strong>#${order.orderNumber}</strong>. Once payment is confirmed, parts will be allocated immediately for packing.`
    : `Thank you for choosing Aurex Truck Parts. We have successfully received your order <strong>#${order.orderNumber}</strong>. Our Campbellfield VIC warehouse team has received your requisition and is preparing parts for dispatch.`;

  const html = renderEmailTemplate({
    title: `Order Received #${order.orderNumber}`,
    badgeText: 'Order Placed',
    badgeBg: '#1e3a8a',
    badgeColor: '#ffffff',
    customerName: getCustomerName(order),
    orderNumber: order.orderNumber,
    statusMessage,
    order
  });

  return sendEmail({
    to: email,
    subject: `Order Received #${order.orderNumber} — Aurex Truck Parts`,
    html
  });
};

/**
 * 2. ORDER CONFIRMED (Payment received / Order confirmed)
 */
const sendOrderConfirmedEmail = async (order) => {
  const email = getCustomerEmail(order);
  if (!email) return;

  const statusMessage = `Great news! Payment has been verified and your order <strong>#${order.orderNumber}</strong> is officially <strong>Confirmed</strong>. Your commercial trailer & truck hardware items are allocated and queued for picking in our Campbellfield facility.`;

  const html = renderEmailTemplate({
    title: `Order Confirmed #${order.orderNumber}`,
    badgeText: 'Confirmed',
    badgeBg: '#059669',
    badgeColor: '#ffffff',
    customerName: getCustomerName(order),
    orderNumber: order.orderNumber,
    statusMessage,
    order
  });

  return sendEmail({
    to: email,
    subject: `Order Confirmed #${order.orderNumber} — Aurex Truck Parts`,
    html
  });
};

/**
 * 3. ORDER PACKED (Picked & packed in warehouse)
 */
const sendOrderPackedEmail = async (order) => {
  const email = getCustomerEmail(order);
  if (!email) return;

  const statusMessage = `Your order <strong>#${order.orderNumber}</strong> has been <strong>Picked & Packed</strong> at our Campbellfield VIC depot. Heavy parts and hardware have been quality inspected and secured in heavy-duty freight packaging, staged for carrier collection.`;

  const html = renderEmailTemplate({
    title: `Order Packed #${order.orderNumber}`,
    badgeText: 'Packed in Depot',
    badgeBg: '#4f46e5',
    badgeColor: '#ffffff',
    customerName: getCustomerName(order),
    orderNumber: order.orderNumber,
    statusMessage,
    order
  });

  return sendEmail({
    to: email,
    subject: `Order Packed & Ready #${order.orderNumber} — Aurex Truck Parts`,
    html
  });
};

/**
 * 4. ORDER DISPATCHED (Collected by courier / in transit)
 */
const sendOrderDispatchedEmail = async (order, extra = {}) => {
  const email = getCustomerEmail(order);
  if (!email) return;

  const carrier = esc(extra.carrier || order.shipping?.carrier || 'Express Road Transport');
  const trackingNumber = esc(extra.trackingNumber || order.shipping?.trackingNumber || 'Available via link below');
  const consignmentId = extra.consignmentId || order.shipping?.consignmentId || null;

  const statusMessage = `Your order <strong>#${order.orderNumber}</strong> has been dispatched from our Campbellfield depot! It has been collected by <strong>${carrier}</strong> and is currently in transit to your nominated address.`;

  const html = renderEmailTemplate({
    title: `Order Dispatched #${order.orderNumber}`,
    badgeText: 'Dispatched & In Transit',
    badgeBg: '#0284c7',
    badgeColor: '#ffffff',
    customerName: getCustomerName(order),
    orderNumber: order.orderNumber,
    statusMessage,
    order,
    tracking: {
      carrier,
      trackingNumber,
      consignmentId
    }
  });

  return sendEmail({
    to: email,
    subject: `Order Dispatched #${order.orderNumber} — In Transit with ${carrier}`,
    html
  });
};

/**
 * 5. ORDER DELIVERED (Successfully received by customer)
 */
const sendOrderDeliveredEmail = async (order) => {
  const email = getCustomerEmail(order);
  if (!email) return;

  const statusMessage = `Your shipment for order <strong>#${order.orderNumber}</strong> has been recorded as <strong>Successfully Delivered</strong>! Please inspect your hardware items upon receiving. If you have any technical or fitment questions, our parts team is always available.`;

  const html = renderEmailTemplate({
    title: `Order Delivered #${order.orderNumber}`,
    badgeText: 'Delivered',
    badgeBg: '#10b981',
    badgeColor: '#ffffff',
    customerName: getCustomerName(order),
    orderNumber: order.orderNumber,
    statusMessage,
    order,
    showReviewCta: true
  });

  return sendEmail({
    to: email,
    subject: `Order Delivered #${order.orderNumber} — Aurex Truck Parts`,
    html
  });
};

/**
 * Universal Order Status Notification Dispatcher
 * Calls the appropriate email function based on canonical status string.
 */
const notifyOrderStatusUpdate = async (order, newStatus, extra = {}) => {
  const st = String(newStatus || '').trim().toLowerCase();

  if (st.includes('deliver')) {
    return sendOrderDeliveredEmail(order);
  }
  if (st.includes('dispatch') || st.includes('transit') || st.includes('courier')) {
    return sendOrderDispatchedEmail(order, extra);
  }
  if (st.includes('pack')) {
    return sendOrderPackedEmail(order);
  }
  if (st.includes('confirm')) {
    return sendOrderConfirmedEmail(order);
  }
  if (st.includes('placed') || st.includes('pending')) {
    return sendOrderPlacedEmail(order);
  }

  // Fallback for custom or unmapped status changes
  console.log(`[Notification Service] Status "${newStatus}" does not trigger an automatic customer email.`);
  return { success: true, unhandledStatus: newStatus };
};

/**
 * Quote Response Email (Preserved from existing enquiry system)
 */
const sendQuoteResponseEmail = async (rawEnquiry) => {
  if (!rawEnquiry.email) return;
  const plainEnquiry = typeof rawEnquiry.toObject === 'function' ? rawEnquiry.toObject() : rawEnquiry;
  const enquiry = {
    ...escFields(plainEnquiry),
    email: rawEnquiry.email,
    quotedPrice: plainEnquiry.quotedPrice,
    truckDetails: escFields(plainEnquiry.truckDetails),
    partDetails: escFields(plainEnquiry.partDetails)
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1e3a8a;">Aurex Truck Parts — Quote #${enquiry.enquiryNumber}</h2>
      <p>Dear ${enquiry.customerName},</p>
      <p>We have reviewed your request for truck parts:</p>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 15px 0;">
        <p><strong>Truck:</strong> ${enquiry.truckDetails?.make || ''} ${enquiry.truckDetails?.model || ''} (${enquiry.truckDetails?.year || ''})</p>
        ${enquiry.truckDetails?.vinOrChassis ? `<p><strong>VIN/Chassis:</strong> ${enquiry.truckDetails.vinOrChassis}</p>` : ''}
        <p><strong>Part:</strong> ${enquiry.partDetails?.partName || 'Requested Truck Part'} (Qty: ${enquiry.partDetails?.quantity || 1})</p>
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 10px 0;" />
        <p style="font-size: 16px; color: #1e3a8a;"><strong>Quoted Price:</strong> $${enquiry.quotedPrice ? enquiry.quotedPrice.toFixed(2) : 'POA'}</p>
        <p><strong>Availability:</strong> ${enquiry.quotedAvailability || 'In Stock - Ready for immediate dispatch'}</p>
        ${enquiry.adminNotes ? `<p><strong>Technical Notes:</strong> ${enquiry.adminNotes}</p>` : ''}
      </div>

      <p>To confirm this order or allocate stock, please call our parts desk on +61 414 730 467 or reply directly to this email.</p>
    </div>
  `;

  return sendEmail({
    to: enquiry.email,
    subject: `Part Quote Ready #${enquiry.enquiryNumber} — Aurex Truck Parts`,
    html
  });
};

module.exports = {
  sendEmail,
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderPackedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
  notifyOrderStatusUpdate,
  sendQuoteResponseEmail,
  // Backward compatibility alias:
  sendOrderConfirmationEmail: sendOrderPlacedEmail
};
