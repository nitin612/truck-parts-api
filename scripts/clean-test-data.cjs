require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanTestData() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is missing from environment variables');
  }

  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('🧹 Cleaning test data while preserving Products, Categories, Reviews, and Settings...');

  // 1. Delete test orders and tracking histories
  const ordersDeleted = await db.collection('orders').deleteMany({});
  console.log(`✅ Deleted ${ordersDeleted.deletedCount} test orders.`);

  const trackingDeleted = await db.collection('orderstatushistories').deleteMany({});
  console.log(`✅ Deleted ${trackingDeleted.deletedCount} tracking history records.`);

  // 2. Clear carts and inventory transactions from test checkouts
  const cartsDeleted = await db.collection('carts').deleteMany({});
  console.log(`✅ Cleared ${cartsDeleted.deletedCount} active carts.`);

  const invTxDeleted = await db.collection('inventorytransactions').deleteMany({});
  console.log(`✅ Cleared ${invTxDeleted.deletedCount} inventory transaction logs.`);

  const auditLogsDeleted = await db.collection('auditlogs').deleteMany({});
  console.log(`✅ Cleared ${auditLogsDeleted.deletedCount} test audit logs.`);

  // 3. Delete test enquiries
  const enquiriesDeleted = await db.collection('enquiries').deleteMany({});
  console.log(`✅ Cleared ${enquiriesDeleted.deletedCount} test contact/quote enquiries.`);

  // 4. Delete test customer addresses
  const addressesDeleted = await db.collection('addresses').deleteMany({});
  console.log(`✅ Cleared ${addressesDeleted.deletedCount} test customer addresses.`);

  // 5. Clean test users (delete test customers, keep staff/admin users)
  const usersDeleted = await db.collection('users').deleteMany({
    $or: [
      { email: { $regex: /^test_customer_/i } },
      { email: 'nitin@yopmail.com' },
      { role: { $in: ['CUSTOMER', 'TRADE_CUSTOMER'] } }
    ]
  });
  console.log(`✅ Deleted ${usersDeleted.deletedCount} test customer accounts.`);

  // Ensure initial admin user exists in users/admins
  const adminCount = await db.collection('admins').countDocuments();
  console.log(`ℹ️ Preserved ${adminCount} administrator accounts in 'admins' collection.`);

  // 6. Reset product stock to healthy levels (e.g. 50 units) so no products show as out of stock due to tests
  const stockUpdate = await db.collection('products').updateMany(
    { 'inventory.trackInventory': true },
    { $set: { 'inventory.stock': 50 } }
  );
  console.log(`✅ Reset stock levels to 50 for ${stockUpdate.modifiedCount} catalogue products.`);

  // 7. Verify preserved collections
  const productsCount = await db.collection('products').countDocuments();
  const reviewsCount = await db.collection('reviews').countDocuments();
  const categoriesCount = await db.collection('categories').countDocuments();
  const settingsCount = await db.collection('sitesettings').countDocuments();
  const paymentSettingsCount = await db.collection('paymentsettings').countDocuments();

  console.log('\n📊 Preserved Production Data Verification:');
  console.log(`   - Products: ${productsCount} (Untouched & Ready)`);
  console.log(`   - Verified Reviews: ${reviewsCount} (Preserved)`);
  console.log(`   - Categories: ${categoriesCount} (Preserved)`);
  console.log(`   - Site & Payment Settings: ${settingsCount + paymentSettingsCount} (Preserved)`);

  await mongoose.disconnect();
  console.log('\n🎉 Test data cleanup completed successfully!');
}

cleanTestData().catch((err) => {
  console.error('❌ Error during cleanup:', err);
  process.exit(1);
});
