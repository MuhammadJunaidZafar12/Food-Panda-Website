import { createSlice } from "@reduxjs/toolkit";
import {
  getCartThunk,
  addToCartThunk,
  updateCartItemThunk,
  removeFromCartThunk,
  clearCartThunk,
} from "./cartThunk";

const initialState = {
  cart: null,
  loading: false,
  error: null,
  success: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError(state) {
      state.error = null;
    },
    clearCartSuccess(state) {
      state.success = false;
    },
    resetCart(state) {
      state.cart = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── GET CART ───────────────────────────────────────────────
      .addCase(getCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(getCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── ADD TO CART ────────────────────────────────────────────
      .addCase(addToCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.success = true;
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ── UPDATE CART ITEM ───────────────────────────────────────
      .addCase(updateCartItemThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── REMOVE FROM CART ───────────────────────────────────────
      .addCase(removeFromCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })
      .addCase(removeFromCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── CLEAR CART ─────────────────────────────────────────────
      .addCase(clearCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.success = true;
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartError, clearCartSuccess, resetCart } =
  cartSlice.actions;
export default cartSlice.reducer;
