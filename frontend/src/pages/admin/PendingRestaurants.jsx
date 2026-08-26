import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
import RestaurantCard from "../../components/ui/RestaurantCard";

const PendingRestaurants = () => {
  const dispatch = useDispatch();
  const pendingRestaurants = useSelector(
    (state) => state.restaurant.pendingRestaurants,
  );

  useEffect(() => {
    // Fetch pending restaurants from the backend when the component mounts
    dispatch(getPendingRestaurantsThunk());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pending Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(pendingRestaurants || []).map((restaurant) => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
            role="admin"
          />
        ))}
      </div>
    </div>
  );
};

export default PendingRestaurants;
