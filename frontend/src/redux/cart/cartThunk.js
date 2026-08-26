import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../services/cart.service";

export const getCartThunk = createAsyncThunk(
  "cart/getCart",
  async (_, thunkAPI) => {
    try {
      return await getCart();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      return await addToCart(productId, quantity);
    } catch (error) {
      // Pass through the full error response for restaurant conflict handling
      const errorData = error.response?.data;
      return thunkAPI.rejectWithValue({
        message: errorData?.message || "Failed to add to cart",
        conflictType: errorData?.conflictType || null,
        status: error.response?.status,
      });
    }
  }
);

export const updateCartItemThunk = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      return await updateCartItem(productId, quantity);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, thunkAPI) => {
    try {
      return await removeFromCart(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart"
      );
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      return await clearCart();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);
