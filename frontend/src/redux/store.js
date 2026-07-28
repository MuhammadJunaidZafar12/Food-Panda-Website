import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import restaurantReducer from "./restaurant/restaurantSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurant: restaurantReducer,
  },
});