import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dotenv.config();

const publicDnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,8.8.4.4")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

const connect = () =>
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    family: 4,
  }); 

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  try {
    await connect();

    console.log("✅ Connected to MongoDB Atlas successfully!");
  } catch (error) {
    if (
      mongoUri.startsWith("mongodb+srv://") &&
      ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"].includes(error.code)
    ) {
      try {
        dns.setServers(publicDnsServers);
        await connect();
        console.log("✅ Connected to MongoDB Atlas successfully!");
        return;
      } catch (fallbackError) {
        console.error(
          "❌ MongoDB connection failed after DNS fallback:",
          fallbackError.message,
        );
        throw fallbackError;
      }
    }

    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;