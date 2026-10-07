const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/truck_parts_db';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
