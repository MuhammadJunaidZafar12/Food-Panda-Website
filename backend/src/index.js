import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Express is wrapped in a raw HTTP server so Socket.IO can share the port in standalone mode.
const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    await connectDB(); 

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start error:", error);
  }
};

// Only listen when running standalone (not in serverless environment)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
