import { createSlice } from "@reduxjs/toolkit";
import {
    createRestaurantThunk,
    getMyRestaurantsThunk,
    getRestaurantByIdThunk,
    getRestaurantsThunk,
    updateRestaurantThunk,
} from "./restaurantThunk";

const initialState = {
    restaurants: [],
    restaurant: null,
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
            );

    },
});

export const { clearRestaurantError, resetRestaurantSuccess } =
    restaurantSlice.actions;
export default restaurantSlice.reducer;