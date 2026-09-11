import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Clock3, Star, Bike, MapPin } from "lucide-react";
import { getPublicRestaurantByIdThunk } from "../../redux/restaurant/restaurantThunk";
import { rateRestaurantThunk } from "../../redux/restaurant/restaurantThunk";
import { getProductsThunk } from "../../redux/product/productThunk";
import ProductCard from "../../components/product/ProductCard";
import useUserLocation from "../../hooks/useUserLocation";
import {
  formatDuration,
  getRoute,
  haversineDistance,
} from "../../services/location.service";

/* ─────────────── StarRating Component ─────────────── */
const StarRating = ({ restaurantId, currentRating, totalReviews, isAuthenticated, initialUserRating }) => {
  const dispatch = useDispatch();
  const { ratingLoading, userRating } = useSelector((state) => state.restaurant);

  // Use redux userRating (kept up to date after submissions) or the initial value from page load
  const myRating = userRating ?? initialUserRating ?? null;

  const [hovered, setHovered] = useState(0);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleRate = async (star) => {
    if (!isAuthenticated) {
      showToast("error", "Please log in to rate this restaurant.");
      return;
    }
    if (ratingLoading) return;

    const result = await dispatch(rateRestaurantThunk({ id: restaurantId, rating: star }));
    if (rateRestaurantThunk.fulfilled.match(result)) {
      const isUpdate = result.payload.message?.includes("updated");
      showToast(
        "success",
        isUpdate
          ? `Rating updated to ${star} star${star > 1 ? "s" : ""}!`
          : `You rated this restaurant ${star} star${star > 1 ? "s" : ""}!`
      );
    } else {
      showToast("error", result.payload || "Failed to submit rating.");
    }
  };

  const displayRating = currentRating ? Number(currentRating).toFixed(1) : null;
  // Hover preview > currently-selected star > existing average (rounded)
  const activeStar = hovered || myRating || Math.round(currentRating || 0);

  return (
    <div className="flex flex-col items-end gap-1 select-none">
      {/* Toast notification */}
      {toast && (
        <div
          className={`absolute right-4 top-4 z-50 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Stars row */}
      <div
        className="flex items-center gap-0.5"
        title={!isAuthenticated ? "Log in to rate this restaurant" : myRating ? "Click to update your rating" : "Rate this restaurant"}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={ratingLoading}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`transition-transform duration-150 ${
              !isAuthenticated
                ? "cursor-default"
                : "cursor-pointer hover:scale-125 active:scale-110"
            }`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={28}
              className={`transition-colors duration-150 ${
                star <= activeStar
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Rating summary */}
      <div className="flex items-center gap-2 text-sm">
        {displayRating ? (
          <>
            <span className="font-bold text-yellow-600 text-base">{displayRating}</span>
            <span className="text-gray-400">
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </>
        ) : (
          <span className="font-semibold text-gray-400 italic text-sm">No ratings yet</span>
        )}
      </div>

      {/* Submitting spinner */}
      {ratingLoading && (
        <span className="text-xs text-pink-500 animate-pulse">Submitting…</span>
      )}

      {/* Contextual hint */}
      {!ratingLoading && isAuthenticated && (
        <span className="text-xs text-gray-400">
          {hovered
            ? `Rate ${hovered} star${hovered > 1 ? "s" : ""}`
            : myRating
            ? `Your rating: ${myRating}★ — click to change`
            : "Click to rate"}
        </span>
      )}
    </div>
  );
};
/* ───────────────────────────────────────────────────── */

const RestaurantDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentRestaurant, loading: restaurantLoading, error: restaurantError, userRating } = useSelector((state) => state.restaurant);
  const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.product);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { latitude, longitude } = useUserLocation();
  const [routeDuration, setRouteDuration] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getPublicRestaurantByIdThunk(id));
      dispatch(getProductsThunk(id));
    }
  }, [dispatch, id]);

  const restaurantCoordinates = currentRestaurant?.location?.coordinates;
  const hasRestaurantCoordinates =
    Array.isArray(restaurantCoordinates) &&
    restaurantCoordinates.length === 2 &&
    Number.isFinite(Number(restaurantCoordinates[0])) &&
    Number.isFinite(Number(restaurantCoordinates[1]));
  const hasUserCoordinates =
    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));

  useEffect(() => {
    if (!hasRestaurantCoordinates || !hasUserCoordinates) return undefined;

    let cancelled = false;
    getRoute(
      { latitude, longitude },
      {
        latitude: Number(restaurantCoordinates[1]),
        longitude: Number(restaurantCoordinates[0]),
      }
    ).then((route) => {
      if (!cancelled) setRouteDuration(route?.duration || null);
    });

    return () => {
      cancelled = true;
    };
  }, [
    latitude,
    longitude,
    hasRestaurantCoordinates,
    hasUserCoordinates,
    restaurantCoordinates,
  ]);

  if (restaurantLoading || !currentRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (restaurantError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
          <p className="mt-2 text-gray-500">{restaurantError}</p>
        </div>
      </div>
    );
  }

  const distanceInKm =
    hasRestaurantCoordinates && hasUserCoordinates
      ? haversineDistance(
          { latitude, longitude },
          {
            latitude: Number(restaurantCoordinates[1]),
            longitude: Number(restaurantCoordinates[0]),
          }
        ) / 1000
      : null;
  const approximateDeliveryTime =
    currentRestaurant.deliveryTime ||
    (routeDuration
      ? `${formatDuration(Math.ceil(routeDuration / 300) * 300 + 15 * 60)} - ${formatDuration(
          Math.ceil(routeDuration / 300) * 300 + 25 * 60
        )}`
      : `${Math.max(20, Math.round(20 + (distanceInKm || 0) * 3))} - ${Math.max(
          35,
          Math.round(35 + (distanceInKm || 0) * 3)
        )} mins`);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="relative h-64 w-full bg-gray-200 md:h-80 lg:h-96">
        {currentRestaurant.banner ? (
          <img
            src={currentRestaurant.banner}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Banner Available
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Restaurant Info Header */}
        <div className="relative -mt-24 mb-10 flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-lg md:-mt-32 md:flex-row md:items-end md:p-8">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md md:h-40 md:w-40">
            {currentRestaurant.logo ? (
              <img
                src={currentRestaurant.logo}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No Logo
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                  {currentRestaurant.name}
                </h1>
                <p className="mt-2 text-lg font-medium text-pink-600">
                  {currentRestaurant.category}
                </p>
              </div>

              {/* ── Interactive Star Rating ── */}
              <div className="relative">
                <StarRating
                  restaurantId={id}
                  currentRating={currentRestaurant.rating}
                  totalReviews={currentRestaurant.totalReviews || 0}
                  isAuthenticated={isAuthenticated}
                  initialUserRating={userRating}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock3 size={20} className="text-gray-400" />
                <span>Approx. {approximateDeliveryTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bike size={20} className="text-gray-400" />
                <span>{currentRestaurant.deliveryFee || "Free Delivery"}</span>
              </div>
              {(currentRestaurant.address || currentRestaurant.location?.address || currentRestaurant.city) && (
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-gray-400" />
                  <span>
                    {currentRestaurant.address || currentRestaurant.location?.address}
                    {(currentRestaurant.address || currentRestaurant.location?.address) && currentRestaurant.city
                      ? `, ${currentRestaurant.city}`
                      : currentRestaurant.city}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="mt-12">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Menu</h2>

          {productsLoading ? (
            <div className="flex py-12 justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
            </div>
          ) : productsError ? (
            <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
              {productsError}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-4 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} role="customer" restaurantId={id} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
              <h3 className="text-xl font-bold text-gray-700">No Products Available</h3>
              <p className="mt-2 text-gray-500">This restaurant hasn't added any products yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;

