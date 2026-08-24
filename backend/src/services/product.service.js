import Product from "../models/product.model.js";

// Create Product
export const createProductService = async (productData) => {
  const product = await Product.create(productData);

  return product;
};

// Get All Products
export const getAllProductsService = async (restaurantId) => {
  const filter = {};

  if (restaurantId) {
    filter.restaurant = restaurantId;
  }

  const products = await Product.find(filter)
    .populate("restaurant", "name slug")
    .sort({ createdAt: -1 });

  return products;
};

// Get Product By ID
export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).populate(
    "restaurant",
    "name slug"
  );

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
};

// Update Product
export const updateProductService = async (
  productId,
  productData
) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    productData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("restaurant", "name slug");

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
};

// Delete Product
export const deleteProductService = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
};