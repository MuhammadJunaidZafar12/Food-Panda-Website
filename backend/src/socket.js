import { Server } from "socket.io";

// Single shared Socket.IO instance, created once in index.js.
let io = null;

/**
 * Attach Socket.IO to the HTTP server.
 * Clients join one room per order (`order:<orderId>`) so live rider
 * location and status updates only reach the people watching that order.
 */
export const initSocket = (httpServer) => {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("order:join", (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on("order:leave", (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });
  });

  console.log("Socket.IO initialised for live order tracking");

  return io;
};

export const getIO = () => io;

/**
 * Emit an event to everyone tracking a specific order.
 * Safe to call before Socket.IO is initialised — it simply does nothing,
 * so the REST API keeps working even if the socket layer is unavailable.
 */
export const emitToOrder = (orderId, event, payload) => {
  if (!io || !orderId) return;

  try {
    io.to(`order:${orderId}`).emit(event, payload);
  } catch (error) {
    console.error("Socket emit failed:", error.message);
  }
};
