import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";


// Create
export const createProductThunk = createAsyncThunk(
  "product/create",
  async (productData, thunkAPI) => {
    try {
      return await createProduct(productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to create product."
      );
    }
  }
);


// Get All
export const getProductsThunk = createAsyncThunk(
  "product/getAll",
  async (restaurantId, thunkAPI) => {
    try {
      return await getProducts(restaurantId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch products."
      );
    }
  }
);


// Get By ID
export const getProductByIdThunk = createAsyncThunk(
  "product/getById",
  async (id, thunkAPI) => {
    try {
      return await getProductById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch product."
      );
    }
  }
);


// Update
export const updateProductThunk = createAsyncThunk(
  "product/update",
  async ({ id, productData }, thunkAPI) => {
    try {
      return await updateProduct(
        id,
        productData
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to update product."
      );
    }
  }
);


// Delete
export const deleteProductThunk = createAsyncThunk(
  "product/delete",
  async (id, thunkAPI) => {
    try {
      return await deleteProduct(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete product."
      );
    }
  }
);