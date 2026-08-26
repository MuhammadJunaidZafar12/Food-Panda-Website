import api from "./axios";

// Create Product
export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data;
};

// Get All Products
export const getProducts = async (restaurantId) => {
  const url = restaurantId
    ? `/products?restaurant=${restaurantId}`
    : "/products";

  const { data } = await api.get(url);
  return data;
};

// Get Product By ID
export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

// Update Product
export const updateProduct = async (id, productData) => {
  const { data } = await api.put(
    `/products/${id}`,
    productData
  );

  return data;
};

// Delete Product
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};