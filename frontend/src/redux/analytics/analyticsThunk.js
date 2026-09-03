import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const getAnalyticsDashboardThunk = createAsyncThunk(
  "analytics/getAnalyticsDashboard",
  async (timeRange = "7days", { rejectWithValue }) => {
    try {
      const response = await api.get("/restaurants/owner/analytics/dashboard", {
        params: { timeRange },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    }
  }
);
