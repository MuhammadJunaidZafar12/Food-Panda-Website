import api from "../api/axios";

export const getRestaurants = async (params = {}) => {
  const response = await api.get("/restaurants", {
    params,
  });

  return response.data;
};

export const getMyRestaurants = async () => {
  const { data } = await api.get("/restaurants/my-restaurants");
  return data;
};

export const createRestaurant = async (restaurantData) => {
  const { data } = await api.post("/restaurants", restaurantData);
  return data;
};

export const getRestaurantById = async (id) => {
  const { data } = await api.get(`/restaurants/${id}`);
  return data;
};

export const updateRestaurant = async (id, formData) => {
  const { data } = await api.put(
    `/restaurants/${id}`,
    formData
  );
  return data;
};