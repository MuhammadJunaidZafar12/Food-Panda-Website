import { Clock3, Star, Bike, MapPin, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  approveRestaurantThunk,
  rejectRestaurantThunk,
} from "../../redux/restaurant/restaurantThunk";
import { useDispatch } from "react-redux";
import { formatDistance } from "../../services/location.service";

const RestaurantCard = ({ restaurant, role = "customer" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleApprove = () => {
    dispatch(approveRestaurantThunk(restaurant._id));
  };

  const handleReject = () => {
    dispatch(rejectRestaurantThunk(restaurant._id));
  };

  const hasDistance =
    restaurant.distance !== undefined &&
    restaurant.distance !== null &&
    !isNaN(restaurant.distance);

  const formattedDist = hasDistance
    ? formatDistance(restaurant.distance)
    : null;

  const distanceInKm = hasDistance ? restaurant.distance / 1000 : null;

  // Calculate estimated delivery time: e.g. 15-20 min base + ~3 min per km
  const estimatedTime =
    restaurant.deliveryTime ||
    (distanceInKm !== null
      ? `${Math.max(15, Math.round(15 + distanceInKm * 3))} - ${Math.max(
          25,
          Math.round(25 + distanceInKm * 3)
        )} mins`
      : "20 - 35 mins");

  const withinDeliveryRadius =
    restaurant.deliveryRadius && distanceInKm !== null
      ? distanceInKm <= restaurant.deliveryRadius
      : true;

  return (
    <div
      className="
        group
        flex
        flex-col
        overflow-hidden
        rounded-2xl
        bg-white
        border
        border-gray-100
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={
            restaurant.banner ||
            restaurant.logo ||
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60"
          }
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Distance Badge */}
        {formattedDist && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-pink-700 shadow-md backdrop-blur-sm">
            <MapPin size={13} className="text-pink-600 shrink-0" />
            <span>{formattedDist}</span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold shadow-md backdrop-blur-sm">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-gray-900">{restaurant.rating || "4.5"}</span>
        </div>

        {/* Delivery Radius Alert if out of range */}
        {hasDistance && !withinDeliveryRadius && (
          <div className="absolute bottom-2 left-3 right-3 rounded-md bg-amber-500/90 px-2 py-0.5 text-center text-[11px] font-medium text-white shadow backdrop-blur-sm">
            Beyond standard delivery radius ({restaurant.deliveryRadius || 5} km)
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between space-y-3 p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
              {restaurant.name}
            </h3>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
              {restaurant.category}
            </span>
            {restaurant.city && <span>• {restaurant.city}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock3 size={15} className="text-gray-400" />
            <span>{estimatedTime}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Bike size={15} className="text-pink-500" />
            <span>
              {restaurant.deliveryFee === 0 || !restaurant.deliveryFee
                ? "Free Delivery"
                : `Rs. ${restaurant.deliveryFee}`}
            </span>
          </div>
        </div>

        {/* Customer View */}
        {role === "customer" && (
          <button
            onClick={() => navigate(`/restaurants/${restaurant._id}`)}
            className="mt-2 w-full rounded-xl bg-pink-600 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 active:scale-[0.98]"
          >
            View Restaurant
          </button>
        )}

        {/* Admin View */}
        {role === "admin" && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleApprove}
              className="flex-1 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={handleReject}
              className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => navigate(`/restaurants/${restaurant._id}`)}
              className="flex-1 rounded-xl bg-pink-600 py-2 text-xs font-semibold text-white hover:bg-pink-700"
            >
              View
            </button>
          </div>
        )}

        {/* Owner View */}
        {role === "owner" && (
          <div className="mt-2 flex gap-3">
            <button
              onClick={() =>
                navigate(`/owner/restaurants/${restaurant._id}/edit`)
              }
              className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => navigate(`/restaurants/${restaurant._id}`)}
              className="flex-1 rounded-xl bg-pink-600 py-2 text-xs font-semibold text-white hover:bg-pink-700"
            >
              View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
