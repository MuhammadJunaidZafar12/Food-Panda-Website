import { createSlice } from "@reduxjs/toolkit";

import {
  createProductThunk,
  getProductsThunk,
  getProductByIdThunk,
  updateProductThunk,
  deleteProductThunk,
} from "./productThunk";

const initialState = {
  products: [],
  product: null,

  loading: false,
  error: null,
  success: false,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },

    clearProductSuccess: (state) => {
      state.success = false;
    },

    clearSelectedProduct: (state) => {
      state.product = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================
      // CREATE
      // =====================================

      .addCase(
        createProductThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        createProductThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          if (action.payload?.product) {
            state.products.unshift(
              action.payload.product
            );
          }
        }
      )

      .addCase(
        createProductThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // =====================================
      // GET ALL
      // =====================================

      .addCase(
        getProductsThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getProductsThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.products =
            action.payload?.products || [];
        }
      )

      .addCase(
        getProductsThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // =====================================
      // GET BY ID
      // =====================================

      .addCase(
        getProductByIdThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getProductByIdThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.product =
            action.payload?.product || null;
        }
      )

      .addCase(
        getProductByIdThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // =====================================
      // UPDATE
      // =====================================
      .addCase(
        updateProductThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        updateProductThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          const updatedProduct =
            action.payload?.product;

          if (updatedProduct) {
            state.products =
              state.products.map((product) =>
                product._id === updatedProduct._id
                  ? updatedProduct
                  : product
              );

            state.product = updatedProduct;
          }
        }
      )

      .addCase(
        updateProductThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      // =====================================
      // DELETE
      // =====================================

      .addCase(
        deleteProductThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteProductThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          const deletedId =
            action.meta.arg;

          state.products =
            state.products.filter(
              (product) =>
                product._id !== deletedId
            );
        }
      )

      .addCase(
        deleteProductThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const {
  clearProductError,
  clearProductSuccess,
  clearSelectedProduct,
} = productSlice.actions;

export default productSlice.reducer;