import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RestaurantCard from "../../components/ui/RestaurantCard";
import { getRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
import useUserLocation from "../../hooks/useUserLocation";

const FeaturedRestaurants = () => {
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector((state) => state.restaurant);
  const { latitude, longitude, hasCoordinates } = useUserLocation();

  useEffect(() => {
    const params = {};
    if (hasCoordinates) {
      params.latitude = latitude;
      params.longitude = longitude;
      params.radius = 15; // wide featured radius
    }
    dispatch(getRestaurantsThunk(params));
  }, [dispatch, latitude, longitude, hasCoordinates]);

  // Optionally limit the number of restaurants shown on the home page
  const featured = restaurants.slice(0, 4);

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-10">
          <h2 className="text-4xl font-bold">
            Featured Restaurants
          </h2>

          <p className="mt-2 text-gray-500">
            Discover top-rated restaurants near you.
          </p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            {featured.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
              />
            ))}

          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedRestaurants;