import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import restaurantReducer from "./restaurant/restaurantSlice";
import productReducer from "./product/productSlice";
import cartReducer from "./cart/cartSlice";
import orderReducer from "./order/orderSlice";
import riderReducer from "./rider/riderSlice";
import locationReducer from "./location/locationSlice";
import analyticsReducer from "./analytics/analyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurant: restaurantReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    rider: riderReducer,
    location: locationReducer,
    analytics: analyticsReducer,
  },
});