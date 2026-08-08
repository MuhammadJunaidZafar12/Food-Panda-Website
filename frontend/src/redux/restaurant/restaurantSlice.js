import { createSlice } from "@reduxjs/toolkit";
import {
    approveRestaurantThunk,
    createRestaurantThunk,
    getMyRestaurantsThunk,
    getPendingRestaurantsThunk,
    getRestaurantByIdThunk,
    getRestaurantsThunk,
    updateRestaurantThunk,
    getAllApprovedRestaurantsThunk,
    getAllRejectedRestaurantsThunk,
    rejectRestaurantThunk,
    getAdminDashboardStatsThunk,
} from "./restaurantThunk";

const initialState = {
    restaurants: [],
    pendingRestaurants: [],
    restaurant: null,
    ApprovedRestaurant: null,
    RejectedRestaurant: null,
    allApprovedRestaurants: [],
    allRejectedRestaurants: [],
    adminDashboard: {
        stats: {
            pendingRestaurants: 0,
            approvedRestaurants: 0,
            rejectedRestaurants: 0,
            totalOwners: 0,
        },

        restaurantGraph: [],
        userGraph: [],
    },
    currentRestaurant: null,
    loading: false,
    error: null,
    success: false,
};

const restaurantSlice = createSlice({
    name: "restaurant",
    initialState,
    reducers: {
        clearRestaurantError: (state) => {
            state.error = null;
        },
        resetRestaurantSuccess: (state) => {
            state.success = false;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(getRestaurantsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRestaurantsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
            })
            .addCase(getRestaurantsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMyRestaurantsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyRestaurantsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
            })
            .addCase(getMyRestaurantsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ===============================
            // CREATE RESTAURANT
            // ===============================

            .addCase(
                createRestaurantThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.success = false;
                }
            )
            .addCase(
                createRestaurantThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.success = true;

                    state.restaurant =
                        action.payload.restaurant;

                    state.restaurants.unshift(
                        action.payload.restaurant
                    );
                }
            )
            .addCase(
                createRestaurantThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.success = false;
                    state.error = action.payload;
                }
            )
            .addCase(
                getRestaurantByIdThunk.pending,
                (state) => {
                    state.loading = true;
                    state.success = false;
                    state.error = null;
                    state.currentRestaurant = null;
                }
            )
            .addCase(
                getRestaurantByIdThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.currentRestaurant =
                        action.payload.restaurant;
                }
            )
            .addCase(
                getRestaurantByIdThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                    state.currentRestaurant = null;
                }
            )
            .addCase(
                updateRestaurantThunk.pending,
                (state) => {
                    state.loading = true;
                    state.success = false;
                    state.error = null;
                }
            )
            .addCase(
                updateRestaurantThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.success = true;
                    state.currentRestaurant =
                        action.payload.restaurant;
                }
            )
            .addCase(
                updateRestaurantThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )
            .addCase(
                getPendingRestaurantsThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addCase(
                getPendingRestaurantsThunk.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.pendingRestaurants =
                        action.payload.restaurants;
                }
            )
            .addCase(
                getPendingRestaurantsThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            .addCase(
                approveRestaurantThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addCase(
                approveRestaurantThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.ApprovedRestaurant = action.payload.restaurant;
                    // Remove the approved restaurant from pendingRestaurants
                    state.pendingRestaurants = state.pendingRestaurants.filter(
                        (r) => r._id !== action.payload.restaurant._id
                    );
                }
            )
            .addCase(
                approveRestaurantThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )
            .addCase(
                getAllApprovedRestaurantsThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addCase(
                getAllApprovedRestaurantsThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.allApprovedRestaurants = action.payload.restaurants;
                }
            )
            .addCase(
                getAllApprovedRestaurantsThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )
            .addCase(
                rejectRestaurantThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addCase(
                rejectRestaurantThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.RejectedRestaurant = action.payload.restaurant;
                    // Remove the rejected restaurant from pendingRestaurants
                    state.pendingRestaurants = state.pendingRestaurants.filter(
                        (r) => r._id !== action.payload.restaurant._id
                    );
                }
            )
            .addCase(
                rejectRestaurantThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )
            .addCase(
                getAllRejectedRestaurantsThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addCase(
                getAllRejectedRestaurantsThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.allRejectedRestaurants = action.payload.restaurants;
                }
            )
            .addCase(
                getAllRejectedRestaurantsThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )
            .addCase(
                getAdminDashboardStatsThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getAdminDashboardStatsThunk.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.adminDashboard = {
                        stats: action.payload.stats,

                        restaurantGraph:
                            action.payload.restaurantGraph,

                        userGraph:
                            action.payload.userGraph,
                    };
                }
            )

            .addCase(
                getAdminDashboardStatsThunk.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Failed to load dashboard";
                }
            )
    },
});

export const { clearRestaurantError, resetRestaurantSuccess } =
    restaurantSlice.actions;
export default restaurantSlice.reducer;