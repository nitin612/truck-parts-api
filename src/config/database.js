const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/truck_parts_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Attempting local fallback...`);
    try {
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/truck_parts_db', {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ MongoDB Connected (Local Fallback): ${localConn.connection.host} (${localConn.connection.name})`);
      return localConn;
    } catch (fallbackError) {
      console.error(`❌ Fatal MongoDB Connection Error: ${fallbackError.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      throw fallbackError;
    }
  }
};

module.exports = connectDB;
