import { io } from "socket.io-client";

/**
 * Shared Socket.IO connection used for live order tracking.
 *
 * The server keeps one room per order, so a page only receives updates for
 * the order it is watching. The connection is created lazily on first use and
 * reused afterwards.
 */

// Same host as the REST API, without the /api prefix.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};

export const joinOrderRoom = (orderId) => {
  if (!orderId) return;
  getSocket().emit("order:join", orderId);
};

export const leaveOrderRoom = (orderId) => {
  if (!orderId || !socket) return;
  socket.emit("order:leave", orderId);
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
