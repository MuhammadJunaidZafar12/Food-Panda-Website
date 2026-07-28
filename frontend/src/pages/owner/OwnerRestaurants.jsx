import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RestaurantCard from "../../components/ui/RestaurantCard";
import { getMyRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";

const OwnerRestaurants = () => {
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(getMyRestaurantsThunk());
  }, [dispatch]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">My Restaurants</h3>
        <p className="mt-2 text-sm text-gray-500">
          These are the restaurants you created and manage.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading your restaurants...</p>
      ) : restaurants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          You have not created any restaurants yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              role="owner"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerRestaurants;
