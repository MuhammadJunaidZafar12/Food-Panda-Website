import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import ProductForm from "../../components/product/ProductForm";

import {
  createProductThunk,
} from "../../redux/product/productThunk";

import {
  clearProductSuccess,
} from "../../redux/product/productSlice";

import {
  getMyRestaurantsThunk,
} from "../../redux/restaurant/restaurantThunk";

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading: productLoading,
    error: productError,
  } = useSelector((state) => state.product);

  const {
    restaurants,
    loading: restaurantLoading,
  } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(getMyRestaurantsThunk());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    const result = await dispatch(
      createProductThunk(formData)
    );

    if (
      createProductThunk.fulfilled.match(result)
    ) {
      toast.success(
        "Product created successfully."
      );

      navigate("/owner/products");
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearProductSuccess());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
            Create Product
          </h1>

          <p className="mt-2 text-gray-500">
            Add a new product to your restaurant.
          </p>
        </div>

        {productError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {productError}
          </div>
        )}

        {restaurantLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            Loading your restaurants...
          </div>
        ) : (
          <ProductForm
            onSubmit={handleSubmit}
            loading={productLoading}
            restaurants={restaurants || []}
          />
        )}

      </div>
    </div>
  );
};

export default CreateProduct;