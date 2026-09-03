import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../../services/auth.service";
import {
    saveToken,
    saveUser,
} from "../../utils/storage";
export const registerThunk = createAsyncThunk(
    "auth/register",

    async (userData, thunkAPI) => {
        try {
            console.log("Register thunk called with userData:", userData);
            const response = await registerUser(userData);
            console.log("Register thunk response:", response);
            saveToken(response.token);
            saveUser(response.user);
            return response;

        } catch (error) {

            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Registration Failed"
            );

        }
    }
);

export const loginThunk = createAsyncThunk(
    "auth/login",

    async (userData, thunkAPI) => {
        try {
            const response = await loginUser(userData);
            saveToken(response.token);
            saveUser(response.user);
            return response;

        } catch (error) {

            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Login Failed"
            );

        }
    }
);

export const getCurrentUserThunk = createAsyncThunk(
  "auth/currentUser",

  async (_, thunkAPI) => {
    try {

      const response = await getCurrentUser();
      return response;

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unauthorized"
      );

    }
  }
);

export const getAllUsersThunk = createAsyncThunk(
  "auth/getAllUsers",
  async (_, thunkAPI) => {
    try {
      return await getAllUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const updateUserRoleThunk = createAsyncThunk(
  "auth/updateUserRole",
  async ({ userId, role }, thunkAPI) => {
    try {
      return await updateUserRole(userId, role);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update user role"
      );
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "auth/deleteUser",
  async (userId, thunkAPI) => {
    try {
      const response = await deleteUser(userId);
      return { userId, message: response.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

export const getProfileThunk = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      return await getProfile();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      return await updateProfile(profileData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);