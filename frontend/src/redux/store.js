import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import restaurantReducer from "./restaurant/restaurantSlice";
import productReducer from "./product/productSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurant: restaurantReducer,
    product: productReducer,
  },
});