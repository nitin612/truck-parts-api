import env from "../config/env.js";

/**
 * Transactional email via Resend's REST API (no SDK dependency).
 *
 * Feature-flagged: if RESEND_API_KEY is not set, emails are skipped and
 * logged instead of sent, so the whole app runs fine in dev/CI without a key.
 * Every send is best-effort and never throws into the request path — callers
 * use `sendEmail(...).catch(() => {})` or await without relying on success.
 */
async function sendEmail({ to, subject, html, replyTo }) {
  if (!env.email.enabled) {
    // eslint-disable-next-line no-console
    console.log(`[email:skipped] to=${to} subject="${subject}" (set RESEND_API_KEY to enable)`);
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.email.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.email.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
  return res.json();
}

/* ─────────────── shared layout ─────────────── */
const money = (n) =>
  n === null || n === undefined
    ? "POA"
    : new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);

function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#0b0e14">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#0b0e14;color:#f5b301;padding:16px 20px;font-weight:800;font-size:18px;border-radius:10px 10px 0 0">AUREX TRUCK PARTS</div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 10px 10px;padding:22px">
      <h1 style="margin:0 0 12px;font-size:19px">${title}</h1>
      ${body}
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:16px 0">Aurex Truck Parts Australia · Campbellfield VIC · This is an automated message.</p>
  </div></body></html>`;
}

function itemsTable(items) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${i.name} <span style="color:#9ca3af">×${i.qty}</span></td>
         <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${money(i.price * i.qty)}</td></tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>`;
}

/* ─────────────── templates ─────────────── */
export function orderConfirmationEmail(order) {
  const track = `${env.appUrl}/track?id=${order.ref}`;
  const body = `
    <p>Thanks ${order.address?.name || ""}, we've received your order <b>${order.ref}</b>.</p>
    ${itemsTable(order.items)}
    <table style="width:100%;font-size:14px;margin-top:10px">
      <tr><td>Subtotal</td><td style="text-align:right">${money(order.subtotal)}</td></tr>
      ${order.discount ? `<tr><td>Discount ${order.promoCode ? `(${order.promoCode})` : ""}</td><td style="text-align:right">-${money(order.discount)}</td></tr>` : ""}
      <tr><td>Freight (${order.shipping})</td><td style="text-align:right">${order.shippingFee === 0 ? "FREE" : money(order.shippingFee)}</td></tr>
      <tr><td style="font-weight:800;padding-top:6px">Total (inc GST)</td><td style="text-align:right;font-weight:800;padding-top:6px">${money(order.total)}</td></tr>
    </table>
    <p style="margin-top:16px">Payment: <b>${order.payment}</b> — status: <b>${order.paymentStatus}</b></p>
    <p><a href="${track}" style="display:inline-block;background:#f5b301;color:#0b0e14;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:8px">Track your order</a></p>`;
  return { subject: `Order ${order.ref} confirmed — Aurex Truck Parts`, html: layout("Order confirmed", body) };
}

export function orderStatusEmail(order) {
  const track = `${env.appUrl}/track?id=${order.ref}`;
  const body = `
    <p>Update on your order <b>${order.ref}</b>:</p>
    <p style="font-size:16px;font-weight:800;color:#1e3a5f">${order.status}</p>
    <p><a href="${track}" style="display:inline-block;background:#f5b301;color:#0b0e14;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:8px">Track your order</a></p>`;
  return { subject: `Order ${order.ref} — ${order.status}`, html: layout("Order update", body) };
}

export function enquiryAlertEmail(enquiry) {
  const body = `
    <p>New enquiry <b>${enquiry.ref}</b>${enquiry.sku ? ` about <b>${enquiry.sku}</b>` : ""}:</p>
    <p><b>${enquiry.name}</b> — ${enquiry.email} ${enquiry.phone ? `· ${enquiry.phone}` : ""}</p>
    <p><b>${enquiry.topic}</b></p>
    <p style="background:#f9fafb;border:1px solid #eee;border-radius:8px;padding:12px">${enquiry.message}</p>`;
  return { subject: `New enquiry ${enquiry.ref} — ${enquiry.name}`, html: layout("New enquiry", body) };
}

export function passwordResetEmail(resetUrl) {
  const body = `
    <p>We received a request to reset your Aurex account password.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:#f5b301;color:#0b0e14;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:8px">Reset password</a></p>
    <p style="color:#6b7280;font-size:13px">This link expires in 1 hour. If you didn't request it, you can ignore this email.</p>`;
  return { subject: "Reset your Aurex password", html: layout("Password reset", body) };
}

export default sendEmail;
