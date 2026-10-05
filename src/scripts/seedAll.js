require('dotenv').config();
const connectDB = require('../config/database');
const Admin = require('../models/Admin');
const seedTruckData = require('./seedTruckData');

const seedAll = async () => {
  try {
    console.log('🌱 Starting Full Database Seeding for Truck Parts API...');
    await connectDB();

    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@truckparts.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Aurex Admin';

    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      await Admin.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      });
      console.log(`✅ Default Super Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    // 2. Seed Truck Brands, Categories, Products, Promos, CMS
    await seedTruckData();

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedAll();
