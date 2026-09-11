import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dotenv.config();

const publicDnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,8.8.4.4")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured in environment variables.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log("✅ Connected to MongoDB Atlas successfully!");
        return mongooseInstance;
      })
      .catch(async (error) => {
        if (
          mongoUri.startsWith("mongodb+srv://") &&
          ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"].includes(error.code)
        ) {
          try {
            dns.setServers(publicDnsServers);
            const fallbackInstance = await mongoose.connect(mongoUri, opts);
            console.log("Connected to MongoDB Atlas successfully (DNS fallback)!");
            return fallbackInstance;
          } catch (fallbackError) {
            console.error("MongoDB DNS fallback failed:", fallbackError.message);
            throw fallbackError;
          }
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;