require('dotenv').config();
const connectDB = require('../config/database');
const Admin = require('../models/Admin');
const User = require('../models/User');
const seedTruckData = require('./seedTruckData');

const seedAll = async () => {
  try {
    console.log('🌱 Starting Full Database Seeding for Truck Parts API...');
    await connectDB();

    // 1. Seed Admins
    const admins = [
      {
        name: 'Store Admin',
        email: 'admin@aurex.com.au',
        password: 'Admin123!',
        role: 'SUPER_ADMIN',
        isActive: true
      },
      {
        name: process.env.ADMIN_NAME || 'Aurex Admin',
        email: process.env.ADMIN_EMAIL || 'admin@truckparts.com',
        password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    ];

    for (const adm of admins) {
      let admin = await Admin.findOne({ email: adm.email });
      if (!admin) {
        await Admin.create(adm);
        console.log(`✅ Super Admin created: ${adm.email}`);
      } else {
        console.log(`ℹ️ Admin already exists: ${adm.email}`);
      }
    }

    // 2. Seed Customer Account
    const demoUserEmail = 'customer@aurex.com.au';
    let demoUser = await User.findOne({ email: demoUserEmail });
    if (!demoUser) {
      await User.create({
        firstName: 'Jane',
        lastName: 'Citizen',
        email: demoUserEmail,
        password: 'Password123!',
        phone: '0400 123 456',
        companyName: 'Victoria Heavy Transport',
        role: 'TRADE_CUSTOMER',
        isTradeApproved: true,
        tradeDiscountPercent: 10
      });
      console.log(`✅ Demo Customer created: ${demoUserEmail}`);
    }

    // 3. Seed Truck Brands, Categories, Products, Promos, CMS, Slides, FAQs, Testimonials
    await seedTruckData();

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedAll();
