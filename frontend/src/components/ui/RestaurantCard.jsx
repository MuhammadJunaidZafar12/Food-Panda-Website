import {
  Clock3,
  Star,
  Bike,
} from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
  return (
    <div
      className="
        group
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      {/* Image */}

      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* Rating */}

        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow">
          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="font-semibold">
            {restaurant.rating}
          </span>
        </div>
      </div>

      {/* Content */}

      <div className="space-y-4 p-5">

        <div>
          <h3 className="text-xl font-bold">
            {restaurant.name}
          </h3>

          <p className="text-gray-500">
            {restaurant.category}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">

          <div className="flex items-center gap-2">
            <Clock3 size={18} />

            <span>
              {restaurant.deliveryTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Bike size={18} />

            <span>
              {restaurant.deliveryFee}
            </span>
          </div>

        </div>

        <button
          className="
            w-full
            rounded-xl
            bg-pink-600
            py-3
            font-semibold
            text-white
            transition
            hover:bg-pink-700
          "
        >
          View Restaurant
        </button>

      </div>
    </div>
  );
};

export default RestaurantCard;