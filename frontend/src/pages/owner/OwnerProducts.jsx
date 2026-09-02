import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Store } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import ProductForm from "../../components/product/ProductForm";

import {
  getMyProductsThunk,
  createProductThunk,
  getProductByIdThunk,
  updateProductThunk,
  deleteProductThunk,
} from "../../redux/product/productThunk";

import { getMyRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";

const OwnerProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products = [],
    loading,
    error,
  } = useSelector((state) => state.product);

  const { restaurants = [] } = useSelector((state) => state.restaurant);

  /*
  |--------------------------------------------------------------------------
  | Dialog States
  |--------------------------------------------------------------------------
  */

  const [openCreate, setOpenCreate] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Products
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(getMyProductsThunk());
    dispatch(getMyRestaurantsThunk());
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Create Product
  |--------------------------------------------------------------------------
  */

  const handleCreateProduct = async (formData) => {
    const result = await dispatch(
      createProductThunk(formData)
    );

    if (createProductThunk.fulfilled.match(result)) {
      toast.success(
        "Product created successfully."
      );

      setOpenCreate(false);

      dispatch(getMyProductsThunk());
    } else {
      toast.error(
        result.payload ||
        "Failed to create product."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open Edit Dialog
  |--------------------------------------------------------------------------
  */

  const handleEdit = async (product) => {
    const result = await dispatch(
      getProductByIdThunk(product._id)
    );

    if (getProductByIdThunk.fulfilled.match(result)) {
      setSelectedProduct(result.payload?.product || result.payload);

      setOpenEdit(true);
    } else {
      toast.error(
        result.payload ||
        "Failed to fetch product."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Update Product
  |--------------------------------------------------------------------------
  */

  const handleUpdateProduct = async (formData) => {
    if (!selectedProduct?._id) {
      toast.error("Product not selected.");

      return;
    }

    const result = await dispatch(
      updateProductThunk({
        id: selectedProduct._id,
        productData: formData,
      })
    );

    if (
      updateProductThunk.fulfilled.match(
        result
      )
    ) {
      toast.success(
        "Product updated successfully."
      );

      setOpenEdit(false);

      setSelectedProduct(null);

      dispatch(getMyProductsThunk());
    } else {
      toast.error(
        result.payload ||
        "Failed to update product."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Product
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const result = await dispatch(
      deleteProductThunk(id)
    );

    if (
      deleteProductThunk.fulfilled.match(
        result
      )
    ) {
      toast.success(
        "Product deleted successfully."
      );

      dispatch(getMyProductsThunk());
    } else {
      toast.error(
        result.payload ||
        "Failed to delete product."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close Edit Dialog
  |--------------------------------------------------------------------------
  */

  const handleCloseEdit = () => {
    setOpenEdit(false);

    setSelectedProduct(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Group Products By Restaurant
  |--------------------------------------------------------------------------
  */

  const groupedProducts = products.reduce(
    (groups, product) => {
      const restaurant =
        product.restaurant;

      const restaurantId =
        restaurant?._id ||
        restaurant ||
        "unknown";

      const restaurantName =
        restaurant?.name ||
        "Unknown Restaurant";

      if (!groups[restaurantId]) {
        groups[restaurantId] = {
          name: restaurantName,
          products: [],
        };
      }

      groups[restaurantId].products.push(
        product
      );

      return groups;
    },
    {}
  );

  const handleAddProductClick = () => {
    if (restaurants.length === 0) {
      toast.error("Please create a restaurant first before adding products.");
      navigate("/owner/restaurants/create");
      return;
    }
    setOpenCreate(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
              My Products
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage the products available
              in your restaurants.
            </p>
          </div>

          <button
            onClick={handleAddProductClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 sm:w-auto"
          >
            <Plus size={20} />

            Add Product
          </button>

        </div>

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* ============================================================
            LOADING
        ============================================================ */}

        {loading && products.length === 0 && (
          <div className="rounded-2xl bg-white py-20 text-center shadow-sm">

            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-pink-600" />

            <p className="text-gray-500">
              Loading products...
            </p>

          </div>
        )}

        {/* ============================================================
            EMPTY: NO RESTAURANT YET
        ============================================================ */}

        {!loading &&
          restaurants.length === 0 &&
          !error && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                <Store
                  size={30}
                  className="text-pink-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                No Restaurant Found
              </h2>

              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                You need to create a restaurant before you can add and manage products.
              </p>

              <Link
                to="/owner/restaurants/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
              >
                <Plus size={18} />
                Create Your First Restaurant
              </Link>

            </div>
          )}

        {/* ============================================================
            EMPTY: RESTAURANT EXISTS BUT NO PRODUCTS YET
        ============================================================ */}

        {!loading &&
          restaurants.length > 0 &&
          products.length === 0 &&
          !error && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                <Plus
                  size={30}
                  className="text-pink-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                No Products Found
              </h2>

              <p className="mt-2 text-gray-500">
                Start adding products to your restaurant menu.
              </p>

              <button
                onClick={() =>
                  setOpenCreate(true)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
              >
                <Plus size={18} />

                Add Product
              </button>

            </div>
          )}

        {/* ============================================================
            PRODUCTS
        ============================================================ */}

        {products.length > 0 && (
          <div className="space-y-8">

            {Object.entries(
              groupedProducts
            ).map(
              ([
                restaurantId,
                restaurantData,
              ]) => (

                <div
                  key={restaurantId}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >

                  {/* Restaurant Header */}

                  <div className="border-b bg-gray-50 px-5 py-4 sm:px-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <h2 className="text-xl font-bold text-gray-800">
                          {
                            restaurantData.name
                          }
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            restaurantData
                              .products
                              .length
                          }{" "}
                          product
                          {restaurantData
                            .products
                            .length !== 1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Product List */}

                  <div className="divide-y">

                    {restaurantData.products.map(
                      (product) => (

                        <div
                          key={
                            product._id
                          }
                          className="flex flex-col gap-4 px-5 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:px-6"
                        >

                          {/* Product Image */}

                          <div className="h-24 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-28">

                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                                No Image
                              </div>
                            )}

                          </div>

                          {/* Product Information */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="truncate text-lg font-bold text-gray-800">
                                {
                                  product.name
                                }
                              </h3>

                              {product.isAvailable !==
                                false && (
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                    Available
                                  </span>
                                )}

                              {product.isAvailable ===
                                false && (
                                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                    Unavailable
                                  </span>
                                )}

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              {
                                product.category
                              }
                            </p>

                            {product.description && (
                              <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                {
                                  product.description
                                }
                              </p>
                            )}

                          </div>

                          {/* Price */}

                          <div className="sm:min-w-[100px] sm:text-right">

                            <p className="text-lg font-bold text-pink-600">
                              Rs.{" "}
                              {
                                product.price
                              }
                            </p>

                          </div>

                          {/* Actions */}

                          <div className="flex gap-2 sm:ml-3">

                            <button
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                              disabled={loading}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >
                              <Pencil
                                size={16}
                              />

                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  product._id
                                )
                              }
                              disabled={loading}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >
                              <Trash2
                                size={16}
                              />

                              Delete
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )
            )}

          </div>
        )}

      </div>

      {/* ================================================================
          CREATE PRODUCT DIALOG
      ================================================================ */}

      <Dialog
        open={openCreate}
        onClose={() =>
          setOpenCreate(false)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >

          Create Product

          <IconButton
            onClick={() =>
              setOpenCreate(false)
            }
          >
            <CloseIcon />
          </IconButton>

        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >

          <ProductForm
            onSubmit={
              handleCreateProduct
            }
            loading={loading}
            restaurants={restaurants}
            onCancel={() =>
              setOpenCreate(false)
            }
          />

        </DialogContent>

      </Dialog>

      {/* ================================================================
          EDIT PRODUCT DIALOG
      ================================================================ */}

      <Dialog
        open={openEdit}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >

          Edit Product

          <IconButton
            onClick={handleCloseEdit}
          >
            <CloseIcon />
          </IconButton>

        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >

          {selectedProduct ? (
              <ProductForm
                initialData={
                  selectedProduct
                }
                onSubmit={
                  handleUpdateProduct
                }
                loading={loading}
                restaurants={restaurants}
                onCancel={
                  handleCloseEdit
                }
              />
          ) : (
            <div className="py-10 text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-pink-600" />

              <p className="text-gray-500">
                Loading product...
              </p>

            </div>
          )}

        </DialogContent>

      </Dialog>

    </div>
  );
};

export default OwnerProducts;