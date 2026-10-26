const mongoose = require('mongoose');

// One connection per serverless instance: concurrent cold requests share the same in-flight connect
let connectPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectPromise) return connectPromise;

  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/truck_parts_db';
  if (mongoUri.endsWith('.mongodb.net/')) {
    mongoUri = mongoUri + 'test?retryWrites=true&w=majority';
  }
  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    // Many short-lived instances each hold a pool; keep them small so Atlas connection limits hold under load
    maxPoolSize: 10,
    maxIdleTimeMS: 60000
  };

  connectPromise = (async () => {
    try {
      const conn = await mongoose.connect(mongoUri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      return conn;
    } catch (error) {
      // A local fallback only makes sense on a developer machine; in the cloud it just adds 5s before failing
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        console.error(`❌ Fatal MongoDB Connection Error: ${error.message}`);
        throw error;
      }
      console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Attempting local fallback...`);
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/truck_parts_db', options);
        console.log(`✅ MongoDB Connected (Local Fallback): ${localConn.connection.host} (${localConn.connection.name})`);
        return localConn;
      } catch (fallbackError) {
        console.error(`❌ Fatal MongoDB Connection Error: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
  })();

  try {
    return await connectPromise;
  } catch (err) {
    // Let the next request retry instead of caching the failure
    connectPromise = null;
    throw err;
  }
};

module.exports = connectDB;
