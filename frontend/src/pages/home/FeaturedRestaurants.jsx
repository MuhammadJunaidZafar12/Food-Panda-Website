import RestaurantCard from "../../components/ui/RestaurantCard";
import { featuredRestaurants } from "../../data/homeData";

const FeaturedRestaurants = () => {
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

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {featuredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}

        </div>

      </div>
    </section>
  );
};

export default FeaturedRestaurants;