/**
 * End-to-end smoke test for the Aurex Truck Parts API.
 *
 * Runs the real Express app + Mongoose against a database and exercises
 * the full flow: catalogue, auth, promos, order creation (with server-side
 * recompute + anti-tamper), POA blocking, public tracking, enquiries and
 * admin gating.
 *
 * Usage:
 *   # Against a throwaway DB on your own Mongo / Atlas (recommended):
 *   MONGO_URI="mongodb://127.0.0.1:27017/aurex_test" node test/smoke.mjs
 *
 *   # Or, if mongodb-memory-server can download a binary on your machine,
 *   # just run it with no MONGO_URI and it will spin one up automatically:
 *   node test/smoke.mjs
 *
 * WARNING: it wipes the catalogue/promo/settings collections in the target
 * DB, so always point it at a *_test database, never production.
 */
import mongoose from "mongoose";

let mongod = null;
if (!process.env.MONGO_URI) {
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri("aurex_test");
}
process.env.JWT_ACCESS_SECRET ||= "test_access";
process.env.JWT_REFRESH_SECRET ||= "test_refresh";
process.env.NODE_ENV = "test";

const { connectDB, disconnectDB } = await import("../src/config/db.js");
const { createApp } = await import("../src/app.js");
const Product = (await import("../src/models/Product.js")).default;
const Category = (await import("../src/models/Category.js")).default;
const Promo = (await import("../src/models/Promo.js")).default;
const Setting = (await import("../src/models/Setting.js")).default;
const User = (await import("../src/models/User.js")).default;
const { PRODUCTS, CATEGORIES, PROMOS, SETTINGS } = await import("../src/seed/data.js");

await connectDB();
await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Promo.deleteMany({}), Setting.deleteMany({})]);
await Category.insertMany(CATEGORIES);
await Product.insertMany(PRODUCTS);
await Promo.insertMany(PROMOS);
await Setting.create(SETTINGS);
await User.findOneAndDelete({ email: "admin@aurex.com.au" });
await User.create({ name: "Store Admin", email: "admin@aurex.com.au", password: "Admin123!", role: "admin" });
await User.findOneAndDelete({ email: "buyer@test.com" });

const app = createApp();
const PORT = 5099;
const server = app.listen(PORT);
const base = `http://127.0.0.1:${PORT}`;
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log("  ✓", l); } else { fail++; console.log("  ✗ FAIL:", l); } };
const j = async (p, o) => { const r = await fetch(base + p, o); return { s: r.status, b: await r.json().catch(() => ({})) }; };
const J = (o) => ({ "Content-Type": "application/json", ...(o || {}) });

try {
  console.log("catalogue");
  check((await j("/api/products?limit=100")).b.total === 36, "36 products seeded");
  check((await j("/api/categories")).b.items.length === 3, "3 categories");
  check((await j("/api/products?buyable=true&limit=100")).b.total === 23, "23 buyable (6 TL + 17 acc)");
  check((await j("/api/products/TL-20-2450-2400")).b.product?.price === 4450, "single product by sku");

  console.log("auth");
  const reg = await j("/api/auth/register", { method: "POST", headers: J(), body: JSON.stringify({ name: "Test Buyer", email: "buyer@test.com", password: "secret123" }) });
  check(reg.s === 201 && reg.b.accessToken, "register returns token");
  check((await j("/api/auth/register", { method: "POST", headers: J(), body: JSON.stringify({ name: "x", email: "buyer@test.com", password: "secret123" }) })).s === 409, "duplicate blocked");
  const login = await j("/api/auth/login", { method: "POST", headers: J(), body: JSON.stringify({ email: "buyer@test.com", password: "secret123" }) });
  check(login.s === 200 && login.b.accessToken, "login ok");
  check((await j("/api/auth/login", { method: "POST", headers: J(), body: JSON.stringify({ email: "buyer@test.com", password: "wrong" }) })).s === 401, "bad password 401");
  const admin = await j("/api/auth/login", { method: "POST", headers: J(), body: JSON.stringify({ email: "admin@aurex.com.au", password: "Admin123!" }) });
  check(admin.b.user?.isAdmin === true, "admin isAdmin flag");
  const adminTok = admin.b.accessToken, custTok = login.b.accessToken;

  console.log("promos");
  check((await j("/api/promos/validate", { method: "POST", headers: J(), body: JSON.stringify({ code: "welcome10" }) })).b.promo?.pct === 10, "active promo validates");
  check((await j("/api/promos/validate", { method: "POST", headers: J(), body: JSON.stringify({ code: "FLEET5" }) })).s === 400, "inactive promo rejected");

  console.log("orders");
  const order = await j("/api/orders", { method: "POST", headers: J(), body: JSON.stringify({ items: [{ sku: "GL-15616", qty: 2 }, { sku: "A20-01S-06", qty: 1 }], promoCode: "WELCOME10", shipping: "Standard road", payment: "Card", address: { name: "Test Buyer", phone: "0400111222", email: "buyer@test.com", address: "1 St", suburb: "Melb", state: "VIC", postcode: "3000" } }) });
  check(order.b.order?.subtotal === 281 && order.b.order?.discount === 28 && order.b.order?.total === 277, "server recomputed totals (281 / -28 / 277)");
  check(/^AUX-\d{4}$/.test(order.b.order?.ref), "order ref AUX-####");
  const ref = order.b.order?.ref;
  check((await j("/api/orders", { method: "POST", headers: J(), body: JSON.stringify({ items: [{ sku: "GL-11113", qty: 1 }], shipping: "Standard road", payment: "Card", address: { name: "x", phone: "0400111222", email: "buyer@test.com" } }) })).s === 400, "POA line blocked at checkout");
  check((await j(`/api/orders/track/${ref}`)).b.order?.ref === ref, "public tracking by ref");

  console.log("enquiries + admin");
  check((await j("/api/enquiries", { method: "POST", headers: J(), body: JSON.stringify({ name: "Mark", email: "m@f.com", message: "Need door gear", sku: "GL-11113" }) })).s === 201, "enquiry created");
  check((await j("/api/admin/stats")).s === 401, "admin blocked without token");
  check((await j("/api/admin/stats", { headers: J({ Authorization: `Bearer ${custTok}` }) })).s === 403, "customer blocked from admin");
  check((await j("/api/admin/stats", { headers: J({ Authorization: `Bearer ${adminTok}` }) })).b.stats?.products === 36, "admin stats ok");
  check((await j(`/api/orders/${ref}/status`, { method: "PATCH", headers: J({ Authorization: `Bearer ${adminTok}` }), body: JSON.stringify({ status: "In transit" }) })).b.order?.status === "In transit", "admin status update");
  check((await j("/api/products", { method: "POST", headers: J({ Authorization: `Bearer ${adminTok}` }), body: JSON.stringify({ sku: "TEST-1", name: "Test Part", category: "accessories", price: 99 }) })).s === 201, "admin product create");
} finally {
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  server.close();
  await disconnectDB();
  if (mongod) await mongod.stop();
  process.exit(fail ? 1 : 0);
}
