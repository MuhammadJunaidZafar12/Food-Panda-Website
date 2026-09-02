import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  getAdminOrderStats,
  assignRider,
  getOrderTracking,
} from "../../services/order.service";

export const placeOrderThunk = createAsyncThunk(
  "order/placeOrder",
  async (orderData, thunkAPI) => {
    try {
      return await placeOrder(orderData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to place order"
      );
    }
  }
);

export const getMyOrdersThunk = createAsyncThunk(
  "order/getMyOrders",
  async (params = {}, thunkAPI) => {
    try {
      return await getMyOrders(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const getOrderByIdThunk = createAsyncThunk(
  "order/getOrderById",
  async (orderId, thunkAPI) => {
    try {
      return await getOrderById(orderId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  "order/cancelOrder",
  async ({ orderId, reason }, thunkAPI) => {
    try {
      return await cancelOrder(orderId, reason);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

export const getRestaurantOrdersThunk = createAsyncThunk(
  "order/getRestaurantOrders",
  async ({ restaurantId, params = {} }, thunkAPI) => {
    try {
      return await getRestaurantOrders(restaurantId, params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurant orders"
      );
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status, note }, thunkAPI) => {
    try {
      return await updateOrderStatus(orderId, status, note);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

export const getAllOrdersThunk = createAsyncThunk(
  "order/getAllOrders",
  async (params = {}, thunkAPI) => {
    try {
      return await getAllOrders(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch all orders"
      );
    }
  }
);

export const getOrderStatsThunk = createAsyncThunk(
  "order/getOrderStats",
  async (_, thunkAPI) => {
    try {
      return await getOrderStats();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch order stats"
      );
    }
  }
);

export const getAdminOrderStatsThunk = createAsyncThunk(
  "order/getAdminOrderStats",
  async (_, thunkAPI) => {
    try {
      return await getAdminOrderStats();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin order stats"
      );
    }
  }
);

export const assignRiderThunk = createAsyncThunk(
  "order/assignRider",
  async ({ orderId, riderId }, thunkAPI) => {
    try {
      return await assignRider(orderId, riderId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to assign rider"
      );
    }
  }
);

export const getOrderTrackingThunk = createAsyncThunk(
  "order/getOrderTracking",
  async (orderId, thunkAPI) => {
    try {
      return await getOrderTracking(orderId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch order tracking"
      );
    }
  }
);
