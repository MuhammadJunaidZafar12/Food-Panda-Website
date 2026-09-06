// import dotenv from "dotenv";

// import http from "http";

// import app from "./app.js";
// import connectDB from "./config/db.js";
// import { initSocket } from "./socket.js";

// dotenv.config();
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB(); 

//     // Express is wrapped in a raw HTTP server so Socket.IO can share the port.
//     const server = http.createServer(app);

//     initSocket(server);

//     server.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// startServer();

import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

let dbConnected = false;

const handler = async (req, res) => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
      console.log("✅ MongoDB connected");
    }

    return app(req, res);
  } catch (error) {
    console.error("❌ Server error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default handler;