import { Clock3, Star, Bike } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { approveRestaurantThunk, rejectRestaurantThunk } from "../../redux/restaurant/restaurantThunk";
import { useSelector, useDispatch } from "react-redux";

const RestaurantCard = ({ restaurant, role = "customer" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleApprove = () => {
    // Implement the logic to approve the restaurant
    dispatch(approveRestaurantThunk(restaurant._id));
  }
  const handleReject = () => {
    // Implement the logic to reject the restaurant
    dispatch(rejectRestaurantThunk(restaurant._id));
  }
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
        hover:shadow-xl
      "
    >
      {/* Image */}

      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={restaurant.banner}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* Rating */}

        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />

          <span className="font-semibold">{restaurant.rating}</span>
        </div>
      </div>

      {/* Content */}

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-xl font-bold">{restaurant.name}</h3>

          <p className="text-gray-500">{restaurant.category}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock3 size={18} />

            <span>{restaurant.deliveryTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <Bike size={18} />

            <span>{restaurant.deliveryFee}</span>
          </div>
        </div>

        {/* Customer */}

        {role === "customer" && (
          <button
            className="w-full rounded-xl bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700"
          >
            View Restaurant
          </button>
        )}



        {/* Admin */}

        {role === "admin" && (
          <div className="flex gap-2">
            <button onClick={handleApprove} className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
              Approve
            </button>

            <button onClick={handleReject} className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700">
              Reject
            </button>

            <button className="flex-1 rounded-xl bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700">
              View
            </button>
          </div>
        )}


        {/* Owner */}

        {role === "owner" && (
          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(`/owner/restaurants/${restaurant._id}/edit`)
              }
              className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Edit
            </button>

            <button className="flex-1 rounded-xl bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700">
              View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
