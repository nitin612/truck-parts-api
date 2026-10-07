const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || 'Aurex Truck Parts <sales@truckparts.com>';

  if (!transporter) {
    console.log(`[Email Skipped - SMTP Not Configured] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

const sendOrderConfirmationEmail = async (order) => {
  const customerEmail = order.shippingAddress?.email;
  if (!customerEmail) return;

  const itemsList = order.items.map(i => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #eee;">${i.name} (SKU: ${i.sku})</td>
      <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${i.quantity}</td>
      <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">$${i.unitPrice.toFixed(2)}</td>
      <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">$${i.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1e3a8a;">Aurex Truck Parts — Order Confirmation</h2>
      <p>Thank you for your order! Your order reference is <strong>#${order.orderNumber}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f3f4f6; text-align: left;">
            <th style="padding: 8px;">Part Details</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right; line-height: 1.6;">
        <p>Subtotal: <strong>$${order.pricing.subtotal.toFixed(2)}</strong></p>
        ${order.pricing.shippingFee > 0 ? `<p>Heavy Freight: <strong>$${order.pricing.shippingFee.toFixed(2)}</strong></p>` : '<p>Freight: <strong>FREE</strong></p>'}
        ${order.pricing.totalCoreDeposit > 0 ? `<p>Core Deposit Surcharge: <strong>$${order.pricing.totalCoreDeposit.toFixed(2)}</strong></p>` : ''}
        ${order.pricing.totalDiscount > 0 ? `<p style="color:green;">Discount: <strong>-$${order.pricing.totalDiscount.toFixed(2)}</strong></p>` : ''}
        <p style="font-size: 18px; color: #1e3a8a;">Grand Total (Inc GST): <strong>$${order.pricing.grandTotal.toFixed(2)}</strong></p>
      </div>

      <div style="margin-top: 20px; padding: 12px; background: #e0f2fe; border-radius: 4px;">
        <p style="margin: 0;"><strong>Payment Method:</strong> ${order.payment.method.replace(/_/g, ' ')}</p>
        <p style="margin: 4px 0 0 0;"><strong>Order Status:</strong> ${order.orderStatus}</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${order.orderNumber} — Aurex Truck Parts`,
    html
  });
};

const sendQuoteResponseEmail = async (enquiry) => {
  if (!enquiry.email) return;

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

      <p>To confirm this order or allocate stock, please call our parts desk or reply directly to this email.</p>
    </div>
  `;

  await sendEmail({
    to: enquiry.email,
    subject: `Part Quote Ready #${enquiry.enquiryNumber} — Aurex Truck Parts`,
    html
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendQuoteResponseEmail
};
