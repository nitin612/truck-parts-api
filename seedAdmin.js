require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const connectDB = require('./src/config/database');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@truckparts.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Aurex Admin';

    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
    } else {
      admin = await Admin.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      });
      console.log(`✅ Default Super Admin created successfully:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
