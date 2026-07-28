import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createRestaurant,
  getMyRestaurants,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
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