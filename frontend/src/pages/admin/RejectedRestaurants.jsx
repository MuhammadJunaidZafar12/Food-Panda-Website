import { XCircle, MapPin, Phone } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRejectedRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";


const RejectedRestaurants = () => {
  const dispatch = useDispatch();
  const { allRejectedRestaurants } = useSelector((state) => state.restaurant);
  const rejectedRestaurants = allRejectedRestaurants?.filter(
    (restaurant) => restaurant.status === "rejected"
  );

  useEffect(() => {
    dispatch(getAllRejectedRestaurantsThunk());
  }, [dispatch]);
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rejected Restaurants</h1>
        <p className="mt-2 text-sm text-gray-500">Review restaurants that were rejected and manage follow-up actions.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {rejectedRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <XCircle className="text-red-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{restaurant.name}</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><MapPin size={16} /> {restaurant.city}</p>
              <p className="flex items-center gap-2"><Phone size={16} /> {restaurant.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectedRestaurants;
