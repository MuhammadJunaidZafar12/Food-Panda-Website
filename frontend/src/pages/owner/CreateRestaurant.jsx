import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import RestaurantForm from "../../components/restaurant/RestaurantForm";
import { createRestaurantThunk } from "../../redux/restaurant/restaurantThunk";
import toast from "react-hot-toast";

const CreateRestaurant = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector(
    (state) => state.restaurant
  );

  const handleSubmit = (formData) => {
    dispatch(createRestaurantThunk(formData));
  };

  useEffect(() => {
    if (success) {
      navigate("/owner/restaurants");
      toast.success("Restaurant Added Successfully")
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Create Restaurant
          </h1>

          <p className="mt-2 text-gray-500">
            Fill in your restaurant details and submit them for admin approval.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <RestaurantForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateRestaurant;