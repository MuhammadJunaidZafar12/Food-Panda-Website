import RestaurantCard from "../ui/RestaurantCard";

const RestaurantGrid = ({ restaurants }) => {
  return (
    <div
      className="
        mt-8
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id}
          restaurant={restaurant}
        />
      ))}
    </div>
  );
};

export default RestaurantGrid;