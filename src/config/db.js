import mongoose from "mongoose";
import env from "./env.js";

mongoose.set("strictQuery", true);

export async function connectDB(uri = env.mongoUri) {
  if (!uri) throw new Error("MONGO_URI is not set");
  mongoose.connection.on("connected", () => {
    // eslint-disable-next-line no-console
    console.log("[db] MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[db] MongoDB error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    // eslint-disable-next-line no-console
    console.warn("[db] MongoDB disconnected");
  });
  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}

export default mongoose;
