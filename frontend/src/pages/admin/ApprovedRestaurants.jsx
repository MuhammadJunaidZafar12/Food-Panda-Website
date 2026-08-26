import { CheckCircle2, MapPin, Phone } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllApprovedRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";


const ApprovedRestaurants = () => {
  const dispatch = useDispatch();
  const { allApprovedRestaurants } = useSelector((state) => state.restaurant)

  console.log(allApprovedRestaurants);
  useEffect(() => {
    dispatch(getAllApprovedRestaurantsThunk())
  }, [dispatch]);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approved Restaurants</h1>
          <p className="mt-2 text-sm text-gray-500">View all restaurants currently approved on the platform.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {(allApprovedRestaurants).map((restaurant) => (
          <div key={restaurant._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2 className="text-green-600" size={20} />
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

export default ApprovedRestaurants;
