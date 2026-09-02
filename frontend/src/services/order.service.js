import api from "../api/axios";

// ── Customer ─────────────────────────────────────────────────────────
export const placeOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data;
};

export const getMyOrders = async (params = {}) => {
  const { data } = await api.get("/orders/my-orders", { params });
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
};

export const cancelOrder = async (orderId, reason) => {
  const { data } = await api.patch(`/orders/${orderId}/cancel`, { reason });
  return data;
};

// ── Live tracking (Customer / Owner / Rider / Admin) ──────────────────
export const getOrderTracking = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}/tracking`);
  return data;
};

// ── Owner ────────────────────────────────────────────────────────────
export const getRestaurantOrders = async (restaurantId, params = {}) => {
  const { data } = await api.get(`/orders/restaurant/${restaurantId}`, {
    params,
  });
  return data;
};

export const updateOrderStatus = async (orderId, status, note) => {
  const { data } = await api.patch(`/orders/${orderId}/status`, {
    status,
    note,
  });
  return data;
};

// ── Rider assignment (Owner / Admin) ─────────────────────────────────
export const assignRider = async (orderId, riderId) => {
  const { data } = await api.patch(`/orders/${orderId}/assign-rider`, {
    riderId,
  });
  return data;
};

// ── Stats (Owner / Admin) ────────────────────────────────────────────
export const getOrderStats = async () => {
  const { data } = await api.get("/orders/stats");
  return data;
};

// ── Admin ────────────────────────────────────────────────────────────
export const getAllOrders = async (params = {}) => {
  const { data } = await api.get("/orders/admin", { params });
  return data;
};

export const getAdminOrderStats = async () => {
  const { data } = await api.get("/orders/admin/stats");
  return data;
};
