import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyDeliveries,
  getMyRiderStats,
  updateMyAvailability,
  updateMyLocation,
  respondToAssignment,
  updateDeliveryStatus,
  getAvailableRiders,
  getAllRiders,
} from "../../services/rider.service";

export const getMyDeliveriesThunk = createAsyncThunk(
  "rider/getMyDeliveries",
  async (params = {}, thunkAPI) => {
    try {
      return await getMyDeliveries(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch your deliveries"
      );
    }
  }
);

export const getMyRiderStatsThunk = createAsyncThunk(
  "rider/getMyRiderStats",
  async (_, thunkAPI) => {
    try {
      return await getMyRiderStats();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch your stats"
      );
    }
  }
);

export const updateMyAvailabilityThunk = createAsyncThunk(
  "rider/updateMyAvailability",
  async (isAvailable, thunkAPI) => {
    try {
      return await updateMyAvailability(isAvailable);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update availability"
      );
    }
  }
);

export const updateMyLocationThunk = createAsyncThunk(
  "rider/updateMyLocation",
  async ({ latitude, longitude }, thunkAPI) => {
    try {
      return await updateMyLocation({ latitude, longitude });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update location"
      );
    }
  }
);

export const respondToAssignmentThunk = createAsyncThunk(
  "rider/respondToAssignment",
  async ({ orderId, action, reason }, thunkAPI) => {
    try {
      return await respondToAssignment(orderId, action, reason);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to respond to this delivery"
      );
    }
  }
);

export const updateDeliveryStatusThunk = createAsyncThunk(
  "rider/updateDeliveryStatus",
  async ({ orderId, status, note }, thunkAPI) => {
    try {
      return await updateDeliveryStatus(orderId, status, note);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update delivery status"
      );
    }
  }
);

export const getAvailableRidersThunk = createAsyncThunk(
  "rider/getAvailableRiders",
  async (_, thunkAPI) => {
    try {
      return await getAvailableRiders();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch available riders"
      );
    }
  }
);

export const getAllRidersThunk = createAsyncThunk(
  "rider/getAllRiders",
  async (params = {}, thunkAPI) => {
    try {
      return await getAllRiders(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch riders"
      );
    }
  }
);
