import { createSlice } from "@reduxjs/toolkit";
import {
  placeOrderThunk,
  getMyOrdersThunk,
  getOrderByIdThunk,
  cancelOrderThunk,
  getRestaurantOrdersThunk,
  updateOrderStatusThunk,
  getAllOrdersThunk,
  getOrderStatsThunk,
  getAdminOrderStatsThunk,
  assignRiderThunk,
  getOrderTrackingThunk,
} from "./orderThunk";

const initialState = {
  orders: [],
  currentOrder: null,
  stats: null,
  loading: false,
  error: null,
  success: false,
  pagination: null,
  statusUpdateLoading: false,

  // ── Live tracking ──────────────────────────────────────────────────
  tracking: null,
  trackingLoading: false,
  assignLoading: false,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    clearOrderSuccess(state) {
      state.success = false;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
    clearTracking(state) {
      state.tracking = null;
    },
    resetOrderState(state) {
      Object.assign(state, initialState);
    },

    // ── Socket.IO events ─────────────────────────────────────────────
    // Status change pushed by the restaurant, rider or admin.
    liveStatusUpdated(state, action) {
      const { orderId, orderStatus, statusHistory } = action.payload;

      if (state.tracking?.orderId === orderId) {
        state.tracking.orderStatus = orderStatus;
        if (statusHistory) state.tracking.statusHistory = statusHistory;
      }

      if (state.currentOrder?._id === orderId) {
        state.currentOrder.orderStatus = orderStatus;
        if (statusHistory) state.currentOrder.statusHistory = statusHistory;
      }

      const listed = state.orders.find((order) => order._id === orderId);
      if (listed) {
        listed.orderStatus = orderStatus;
        if (statusHistory) listed.statusHistory = statusHistory;
      }
    },

    // New GPS position from the rider's device.
    liveRiderLocationUpdated(state, action) {
      const { orderId, latitude, longitude, updatedAt } = action.payload;

      if (state.tracking?.orderId === orderId && state.tracking.rider) {
        state.tracking.rider.latitude = latitude;
        state.tracking.rider.longitude = longitude;
        state.tracking.rider.locationUpdatedAt = updatedAt;
      }
    },

    // A rider was assigned, or responded to their assignment.
    liveRiderAssignmentUpdated(state, action) {
      const { orderId, rider, riderStatus } = action.payload;

      if (state.tracking?.orderId === orderId) {
        state.tracking.riderStatus = riderStatus;
        state.tracking.rider = rider
          ? {
              _id: rider._id,
              name: rider.name,
              phone: rider.phone,
              vehicleType: rider.vehicleType,
              vehicleNumber: rider.vehicleNumber,
              latitude: rider.currentLocation?.latitude ?? null,
              longitude: rider.currentLocation?.longitude ?? null,
              locationUpdatedAt: rider.currentLocation?.updatedAt ?? null,
            }
          : null;
      }

      if (state.currentOrder?._id === orderId) {
        state.currentOrder.riderStatus = riderStatus;
        state.currentOrder.assignedRider = rider || null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── PLACE ORDER ─────────────────────────────────────────────
      .addCase(placeOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.success = true;
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ── GET MY ORDERS ───────────────────────────────────────────
      .addCase(getMyOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── GET ORDER BY ID ─────────────────────────────────────────
      .addCase(getOrderByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(getOrderByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── CANCEL ORDER ────────────────────────────────────────────
      .addCase(cancelOrderThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.error = null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        state.currentOrder = action.payload.order;
        state.success = true;
        // Update in orders list
        const idx = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (idx !== -1) {
          state.orders[idx] = action.payload.order;
        }
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.error = action.payload;
      })

      // ── GET RESTAURANT ORDERS ───────────────────────────────────
      .addCase(getRestaurantOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestaurantOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(getRestaurantOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── UPDATE ORDER STATUS ─────────────────────────────────────
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        state.success = true;
        // Update in orders list
        const idx = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (idx !== -1) {
          state.orders[idx] = action.payload.order;
        }
        // Also update currentOrder if viewing
        if (state.currentOrder?._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.error = action.payload;
      })

      // ── GET ALL ORDERS (Admin) ──────────────────────────────────
      .addCase(getAllOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── GET ORDER STATS ─────────────────────────────────────────
      .addCase(getOrderStatsThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(getOrderStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      .addCase(getOrderStatsThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── GET ADMIN ORDER STATS ───────────────────────────────────
      .addCase(getAdminOrderStatsThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(getAdminOrderStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      .addCase(getAdminOrderStatsThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── ASSIGN RIDER (Owner / Admin) ────────────────────────────
      .addCase(assignRiderThunk.pending, (state) => {
        state.assignLoading = true;
        state.error = null;
      })
      .addCase(assignRiderThunk.fulfilled, (state, action) => {
        state.assignLoading = false;
        state.success = true;

        const updated = action.payload.order;

        const idx = state.orders.findIndex((o) => o._id === updated._id);
        if (idx !== -1) {
          state.orders[idx] = updated;
        }

        if (state.currentOrder?._id === updated._id) {
          state.currentOrder = updated;
        }
      })
      .addCase(assignRiderThunk.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload;
      })

      // ── GET ORDER TRACKING ──────────────────────────────────────
      .addCase(getOrderTrackingThunk.pending, (state) => {
        state.trackingLoading = true;
        state.error = null;
      })
      .addCase(getOrderTrackingThunk.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.tracking = action.payload.tracking;
      })
      .addCase(getOrderTrackingThunk.rejected, (state, action) => {
        state.trackingLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearOrderError,
  clearOrderSuccess,
  clearCurrentOrder,
  clearTracking,
  resetOrderState,
  liveStatusUpdated,
  liveRiderLocationUpdated,
  liveRiderAssignmentUpdated,
} = orderSlice.actions;

export default orderSlice.reducer;
