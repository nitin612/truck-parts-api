/**
 * Seed script.
 *   npm run seed            → wipe catalogue/promos/settings, insert fresh, ensure admin
 *   npm run seed:destroy    → remove all seeded collections
 *
 * Users/orders are NOT wiped (except the admin is upserted), so you can
 * reseed the catalogue without losing accounts or test orders.
 */
import env from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Promo from "../models/Promo.js";
import Setting from "../models/Setting.js";
import User from "../models/User.js";
import { PRODUCTS, CATEGORIES, PROMOS, SETTINGS } from "./data.js";

const destroy = process.argv.includes("--destroy");

async function run() {
  await connectDB();

  if (destroy) {
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Promo.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    // eslint-disable-next-line no-console
    console.log("[seed] Destroyed catalogue, categories, promos and settings.");
    await disconnectDB();
    return;
  }

  await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Promo.deleteMany({})]);
  await Category.insertMany(CATEGORIES);
  await Product.insertMany(PRODUCTS);
  await Promo.insertMany(PROMOS);
  await Setting.findOneAndUpdate({ key: "store" }, SETTINGS, { upsert: true, new: true });

  // Ensure the admin account exists (password hashed by the User pre-save hook)
  const existing = await User.findOne({ email: env.admin.email });
  if (existing) {
    existing.role = "admin";
    existing.password = env.admin.password; // re-hashed on save
    existing.name = existing.name || env.admin.name;
    await existing.save();
  } else {
    await User.create({
      name: env.admin.name,
      email: env.admin.email,
      password: env.admin.password,
      role: "admin",
      company: "Aurex HQ",
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `[seed] Done: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${PROMOS.length} promos, settings + admin (${env.admin.email}).`
  );
  await disconnectDB();
}

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] Failed:", err);
  await disconnectDB();
  process.exit(1);
});
