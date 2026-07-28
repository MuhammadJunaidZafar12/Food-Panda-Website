import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import RestaurantForm from "../../components/restaurant/RestaurantForm";

import {
  getRestaurantByIdThunk,
  updateRestaurantThunk,
} from "../../redux/restaurant/restaurantThunk";
import { resetRestaurantSuccess } from "../../redux/restaurant/restaurantSlice";

const EditRestaurant = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    currentRestaurant,
    loading,
    error,
    success,
  } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(resetRestaurantSuccess());
    dispatch(getRestaurantByIdThunk(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      toast.success("Restaurant updated successfully.");
      dispatch(resetRestaurantSuccess());
      navigate("/owner/restaurants");
    }
  }, [success, navigate, dispatch]);

  const handleSubmit = (formData) => {
    dispatch(
      updateRestaurantThunk({
        id,
        formData,
      })
    );
  };

  if (loading && !currentRestaurant) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Edit Restaurant
          </h1>

          <p className="mt-2 text-gray-500">
            Update your restaurant information.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-600">
            {error}
          </div>
        )}

        {currentRestaurant && (
          <RestaurantForm
            initialValues={currentRestaurant}
            onSubmit={handleSubmit}
            loading={loading}
            mode="edit"
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditRestaurant;