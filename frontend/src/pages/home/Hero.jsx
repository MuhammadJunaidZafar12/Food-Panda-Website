import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { becomeOwnerUser } from "../../services/auth.service";
import { saveUser } from "../../utils/storage";
import { setUser } from "../../redux/auth/authSlice";
import useUserLocation from "../../hooks/useUserLocation";
import { searchAddress } from "../../services/location.service";

const Hero = () => {
  const navigate = useNavigate();
  const heroImage = "https://picsum.photos/400/300?random=1";
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { locateUser, updateDestination, address } = useUserLocation();

  const [searchLoc, setSearchLoc] = useState(address || "");
  const [locating, setLocating] = useState(false);

  const handleGpsLocate = async () => {
    setLocating(true);
    try {
      const loc = await locateUser();
      setSearchLoc(loc.address || "Current Location");
      toast.success("Location detected! Finding nearby restaurants...");
      navigate(
        `/restaurants?lat=${loc.latitude}&lng=${loc.longitude}&radius=5`
      );
    } catch (err) {
      toast.error(err.message || "Could not detect location.");
    } finally {
      setLocating(false);
    }
  };

  const handleSearchNearby = async () => {
    const query = searchLoc.trim();
    if (!query) {
      navigate("/restaurants?radius=5");
      return;
    }

    try {
      const results = await searchAddress(query, 1);
      if (results.length > 0) {
        const first = results[0];
        updateDestination({
          latitude: first.latitude,
          longitude: first.longitude,
          address: first.label,
          city: first.city,
          radius: 5,
        });
        navigate(
          `/restaurants?lat=${first.latitude}&lng=${first.longitude}&radius=5&address=${encodeURIComponent(
            first.label
          )}`
        );
      } else {
        // Fallback to text search
        navigate(`/restaurants?search=${encodeURIComponent(query)}&radius=5`);
      }
    } catch {
      navigate(`/restaurants?search=${encodeURIComponent(query)}&radius=5`);
    }
  };

  const handleClick = async () => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    if (user.role === "owner") {
      toast.success("You are already an owner.");
      return;
    }

    try {
      const response = await becomeOwnerUser();
      saveUser(response.user);
      dispatch(setUser(response.user));
      toast.success(response.message || "Role updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update role");
    }
  };

  return (
    <section className="bg-gradient-to-r from-pink-50 to-white">
      <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-between gap-12 px-6 py-16 lg:flex-row">

        {/* Left */}
        <div className="max-w-xl">

          <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-600">
            🍔 Pakistan's Favourite Food Delivery
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-gray-900">
            Enjoy your favourite food,
            <span className="text-pink-600"> anytime.</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover restaurants near you, order delicious meals,
            and get them delivered to your doorstep in minutes.
          </p>

          {/* Destination & Nearby Search Bar */}
          <div className="mt-8 rounded-2xl bg-white p-3 shadow-xl border border-pink-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <MapPin
                  size={20}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-600"
                />
                <input
                  type="text"
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchNearby()}
                  placeholder="Enter your street or delivery address…"
                  className="w-full rounded-xl bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-pink-200 border border-gray-200 focus:border-pink-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGpsLocate}
                  disabled={locating}
                  className="flex items-center gap-1.5 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-xs font-bold text-pink-700 transition hover:bg-pink-100 active:scale-95 disabled:opacity-60 shrink-0"
                  title="Detect my current GPS location"
                >
                  {locating ? (
                    <Loader2 size={16} className="animate-spin text-pink-600" />
                  ) : (
                    <Crosshair size={16} className="text-pink-600" />
                  )}
                  <span>{locating ? "Locating…" : "Locate Me"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSearchNearby}
                  className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-pink-200 transition hover:bg-pink-700 active:scale-95 shrink-0"
                >
                  Find Food (5km)
                </button>
              </div>
            </div>

            {/* Quick Filter Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
              <span className="font-semibold text-gray-400">Popular:</span>
              <button
                onClick={handleGpsLocate}
                className="rounded-full bg-pink-50 px-3 py-1 font-medium text-pink-700 transition hover:bg-pink-100"
              >
                📍 Within 5 km
              </button>
              <button
                onClick={() => navigate("/restaurants?category=Fast Food")}
                className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                🍔 Burgers & Fast Food
              </button>
              <button
                onClick={() => navigate("/restaurants?category=Pizza")}
                className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                🍕 Pizza
              </button>
            </div>
          </div>

          {/* Become Owner Quick Link */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span>Want to partner with us?</span>
            <button
              onClick={handleClick}
              className="font-semibold text-pink-600 underline hover:text-pink-700"
            >
              {user?.role === "owner" ? "Owner Dashboard" : "List your restaurant as an Owner"}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-10">

            <div>
              <h2 className="text-3xl font-bold text-pink-600">
                500+
              </h2>

              <p className="text-gray-500">
                Restaurants
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-pink-600">
                50K+
              </h2>

              <p className="text-gray-500">
                Happy Customers
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-pink-600">
                30 min
              </h2>

              <p className="text-gray-500">
                Delivery
              </p>
            </div>

          </div>

        </div>

        {/* Right */}
        <div className="flex justify-center">

          <img src={heroImage} alt="Random" className="max-w-2xl drop-shadow-2xl" />
            

        </div>

      </div>
    </section>
  );
};

export default Hero;