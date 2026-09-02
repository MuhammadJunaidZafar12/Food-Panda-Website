import api from "../api/axios";

// ── Rider's own dashboard ────────────────────────────────────────────
export const getMyDeliveries = async (params = {}) => {
  const { data } = await api.get("/riders/me/orders", { params });
  return data;
};

export const getMyRiderStats = async () => {
  const { data } = await api.get("/riders/me/stats");
  return data;
};

export const updateMyAvailability = async (isAvailable) => {
  const { data } = await api.patch("/riders/me/availability", { isAvailable });
  return data;
};

export const updateMyLocation = async ({ latitude, longitude }) => {
  const { data } = await api.patch("/riders/me/location", {
    latitude,
    longitude,
  });
  return data;
};

// ── Rider actions on an assigned order ───────────────────────────────
export const respondToAssignment = async (orderId, action, reason) => {
  const { data } = await api.patch(`/riders/orders/${orderId}/respond`, {
    action,
    reason,
  });
  return data;
};

export const updateDeliveryStatus = async (orderId, status, note) => {
  const { data } = await api.patch(`/riders/orders/${orderId}/status`, {
    status,
    note,
  });
  return data;
};

// ── Rider directory ──────────────────────────────────────────────────
export const getAvailableRiders = async () => {
  const { data } = await api.get("/riders/available");
  return data;
};

export const getAllRiders = async (params = {}) => {
  const { data } = await api.get("/riders", { params });
  return data;
};
