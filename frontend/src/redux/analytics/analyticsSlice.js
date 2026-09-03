import { createSlice } from "@reduxjs/toolkit";
import { getAnalyticsDashboardThunk } from "./analyticsThunk";

const initialState = {
  analytics: null,
  loading: false,
  error: null,
  timeRange: "7days",
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setAnalyticsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAnalyticsSuccess: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
      state.error = null;
    },
    setAnalyticsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAnalyticsDashboardThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnalyticsDashboardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(getAnalyticsDashboardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.analytics = null;
      });
  },
});

export const {
  setAnalyticsLoading,
  setAnalyticsSuccess,
  setAnalyticsError,
  setTimeRange,
  clearAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
