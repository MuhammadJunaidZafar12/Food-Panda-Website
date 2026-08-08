import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createRestaurant,
  getMyRestaurants,
  getPendingRestaurants,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
  approveRestaurant,
  rejectRestaurant,
  getAllApprovedRestaurants,
  getRejectedRestaurants,
  getAdminDashboardStats,
} from "../../services/restaurant.service";

export const getRestaurantsThunk = createAsyncThunk(
  "restaurant/getRestaurants",
  async (params, thunkAPI) => {
    try {
      return await getRestaurants(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurants."
      );
    }
  }
);

export const getMyRestaurantsThunk = createAsyncThunk(
  "restaurant/getMyRestaurants",
  async (_, thunkAPI) => {
    try {
      return await getMyRestaurants();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch your restaurants."
      );
    }
  }
);

export const createRestaurantThunk = createAsyncThunk(
  "restaurant/create",
  async (restaurantData, thunkAPI) => {
    try {
      return await createRestaurant(restaurantData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getRestaurantByIdThunk = createAsyncThunk(
  "restaurant/getById",
  async (id, thunkAPI) => {
    try {
      return await getRestaurantById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
);

export const updateRestaurantThunk = createAsyncThunk(
  "restaurant/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await updateRestaurant(id, formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
);

export const getPendingRestaurantsThunk =
  createAsyncThunk(
    "restaurant/getPending",
    async (_, thunkAPI) => {
      try {
        return await getPendingRestaurants();
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message
        );
      }
    }
  );

export const approveRestaurantThunk = createAsyncThunk(
  "restaurant/approve",
  async (id, thunkAPI) => {
    try {
      return await approveRestaurant(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  })

export const getAllApprovedRestaurantsThunk = createAsyncThunk(
  "restaurant/getAllApproved",
  async (_, thunkAPI) => {
    try {
      return await getAllApprovedRestaurants();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
)

// Get all rejected restaurants
export const getAllRejectedRestaurantsThunk = createAsyncThunk(
  "restaurant/getRejected",
  async (_, thunkAPI) => {
    try {
      return await getRejectedRestaurants();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
)
export const rejectRestaurantThunk = createAsyncThunk(
  "restaurant/reject",
  async (id, thunkAPI) => {
    try {
      return await rejectRestaurant(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  })

  export const getAdminDashboardStatsThunk =
  createAsyncThunk(
    "restaurant/getAdminDashboardStats",
    async (_, thunkAPI) => {
      try {
        return await getAdminDashboardStats();
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch dashboard stats"
        );
      }
    }
  );