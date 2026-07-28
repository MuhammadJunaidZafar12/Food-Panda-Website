import api from "../api/axios";

export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const loginUser = async (userData) => {
  const { data } = await api.post("/auth/login", userData);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const becomeOwnerUser = async () => {
  const { data } = await api.patch("/auth/become-owner");
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};