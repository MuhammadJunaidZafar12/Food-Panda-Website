import api from "../api/axios";

export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

export const addToCart = async (productId, quantity = 1) => {
  const { data } = await api.post("/cart", { productId, quantity });
  return data;
};

export const updateCartItem = async (productId, quantity) => {
  const { data } = await api.put(`/cart/${productId}`, { quantity });
  return data;
};

export const removeFromCart = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete("/cart/clear");
  return data;
};
