import { createSlice } from "@reduxjs/toolkit";
import {
  getMyDeliveriesThunk,
  getMyRiderStatsThunk,
  updateMyAvailabilityThunk,
  updateMyLocationThunk,
  respondToAssignmentThunk,
  updateDeliveryStatusThunk,
  getAvailableRidersThunk,
  getAllRidersThunk,
} from "./riderThunk";

const initialState = {
  // Rider's own deliveries
  deliveries: [],
  pagination: null,
  stats: null,

  // Rider directory (owner / admin)
  availableRiders: [],
  riders: [],

  isAvailable: false,
  lastKnownLocation: null,

  loading: false,
  actionLoading: false,
  error: null,
  success: false,
  message: null,
};

const riderSlice = createSlice({
  name: "rider",
  initialState,
  reducers: {
    clearRiderError(state) {
      state.error = null;
    },
    clearRiderSuccess(state) {
      state.success = false;
      state.message = null;
    },
    resetRiderState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Replaces an order wherever it appears in the rider's list.
    const syncDelivery = (state, order) => {
      const idx = state.deliveries.findIndex((o) => o._id === order._id);
      if (idx !== -1) {
        state.deliveries[idx] = order;
      }
    };

    builder
      // ── MY DELIVERIES ───────────────────────────────────────────
      .addCase(getMyDeliveriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyDeliveriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveries = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyDeliveriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── MY STATS ────────────────────────────────────────────────
      .addCase(getMyRiderStatsThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(getMyRiderStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        // Restores the online/offline toggle after a page reload.
        state.isAvailable = Boolean(action.payload.stats?.isAvailable);
        if (action.payload.stats?.currentLocation) {
          state.lastKnownLocation = action.payload.stats.currentLocation;
        }
      })
      .addCase(getMyRiderStatsThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── AVAILABILITY ────────────────────────────────────────────
      .addCase(updateMyAvailabilityThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateMyAvailabilityThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isAvailable = action.payload.isAvailable;
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(updateMyAvailabilityThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // ── GPS LOCATION ────────────────────────────────────────────
      // Fires often in the background, so it deliberately does not touch
      // the shared loading/error flags used by the visible UI.
      .addCase(updateMyLocationThunk.fulfilled, (state, action) => {
        state.lastKnownLocation = action.payload.currentLocation;
      })

      // ── ACCEPT / REJECT ─────────────────────────────────────────
      .addCase(respondToAssignmentThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(respondToAssignmentThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.message = action.payload.message;
        syncDelivery(state, action.payload.order);
      })
      .addCase(respondToAssignmentThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // ── DELIVERY STATUS ─────────────────────────────────────────
      .addCase(updateDeliveryStatusThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateDeliveryStatusThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.message = action.payload.message;
        syncDelivery(state, action.payload.order);
      })
      .addCase(updateDeliveryStatusThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // ── AVAILABLE RIDERS (Owner / Admin) ────────────────────────
      .addCase(getAvailableRidersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableRidersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.availableRiders = action.payload.riders;
      })
      .addCase(getAvailableRidersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── ALL RIDERS (Admin) ──────────────────────────────────────
      .addCase(getAllRidersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRidersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.riders = action.payload.riders;
      })
      .addCase(getAllRidersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRiderError, clearRiderSuccess, resetRiderState } =
  riderSlice.actions;

export default riderSlice.reducer;
