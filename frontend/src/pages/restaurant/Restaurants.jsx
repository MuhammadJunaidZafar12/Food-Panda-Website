import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Crosshair,
  LayoutGrid,
  Map as MapIcon,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

import RestaurantGrid from "../../components/restaurant/RestaurantGrid";
import RestaurantSkeleton from "../../components/restaurant/RestaurantSkeleton";
import NearbyMap from "../../components/restaurant/NearbyMap";
import DestinationModal from "../../components/map/DestinationModal";
import useUserLocation from "../../hooks/useUserLocation";
import { getRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";

const CATEGORIES = [
  "All",
  "Fast Food",
  "Pizza",
  "Burgers",
  "Pakistani / Desi",
  "Chinese",
  "Cafe",
  "Desserts",
  "Beverages",
  "Biryani",
];

const RADIUS_PRESETS = [
  { label: "2 km", value: 2 },
  { label: "5 km (Standard)", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "All Distances", value: 0 },
];

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { restaurants, loading } = useSelector((state) => state.restaurant);

  // User location hook
  const {
    latitude: savedLat,
    longitude: savedLng,
    address: savedAddress,
    label: savedLabel,
    radius: savedRadius,
    locateUser,
    isLocating,
    updateRadius,
  } = useUserLocation();

  // Read URL params or fallback to state
  const keywordParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");
  const sortByParam = searchParams.get("sortBy") || "nearest";

  // Effective location coordinates
  const effectiveLat = latParam ? Number(latParam) : savedLat;
  const effectiveLng = lngParam ? Number(lngParam) : savedLng;
  const effectiveRadius =
    radiusParam !== null && radiusParam !== undefined
      ? Number(radiusParam)
      : savedRadius || 5;

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [selectedRadius, setSelectedRadius] = useState(effectiveRadius);
  const [sortBy, setSortBy] = useState(sortByParam);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [onlyDeliverable, setOnlyDeliverable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync parameters to fetch restaurants
  useEffect(() => {
    const params = {
      search: keywordParam,
    };

    if (activeCategory && activeCategory !== "All") {
      params.category = activeCategory;
    }

    if (
      effectiveLat !== null &&
      effectiveLng !== null &&
      Number.isFinite(effectiveLat) &&
      Number.isFinite(effectiveLng)
    ) {
      params.latitude = effectiveLat;
      params.longitude = effectiveLng;

      if (selectedRadius > 0) {
        params.radius = selectedRadius;
      }
    }

    if (sortBy) {
      params.sortBy = sortBy;
    }

    if (onlyDeliverable) {
      params.onlyDeliverable = true;
    }

    dispatch(getRestaurantsThunk(params));
  }, [
    dispatch,
    keywordParam,
    activeCategory,
    effectiveLat,
    effectiveLng,
    selectedRadius,
    sortBy,
    onlyDeliverable,
  ]);

  const handleGpsQuick = async () => {
    try {
      const loc = await locateUser();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("lat", loc.latitude);
        next.set("lng", loc.longitude);
        next.set("radius", selectedRadius || 5);
        return next;
      });
      toast.success("Location updated! Showing restaurants near you.");
    } catch (err) {
      toast.error(err.message || "Failed to detect GPS location.");
    }
  };

  const handleRadiusSelect = (r) => {
    setSelectedRadius(r);
    updateRadius(r);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (r > 0) {
        next.set("radius", r);
      } else {
        next.delete("radius");
      }
      return next;
    });
  };

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat !== "All") {
        next.set("category", cat);
      } else {
        next.delete("category");
      }
      return next;
    });
  };

  const activeDestinationLabel =
    savedLabel || savedAddress || (effectiveLat ? `${effectiveLat.toFixed(3)}, ${effectiveLng.toFixed(3)}` : "");

  const hasActiveCoordinates =
    effectiveLat !== null &&
    effectiveLng !== null &&
    Number.isFinite(effectiveLat) &&
    Number.isFinite(effectiveLng);

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Top Banner / Location Hero */}
      <div className="border-b border-gray-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Title & Active Destination */}
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  <MapPin size={16} />
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  {keywordParam
                    ? `Restaurants matching "${keywordParam}"`
                    : hasActiveCoordinates
                    ? `Restaurants Near You (${selectedRadius > 0 ? selectedRadius + " km" : "All Distances"})`
                    : "All Restaurants"}
                </h1>
              </div>

              {/* Destination badge */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="font-medium text-gray-500">Destination:</span>
                {hasActiveCoordinates ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-200 px-3 py-1 font-semibold text-pink-700">
                    <span className="max-w-xs truncate">{activeDestinationLabel}</span>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="ml-1 underline hover:text-pink-900"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1 font-semibold text-pink-600 underline hover:text-pink-700"
                  >
                    Set your destination to see exact 5 km distance
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleGpsQuick}
                  disabled={isLocating}
                  className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                >
                  <Crosshair size={13} className="text-pink-600" />
                  <span>{isLocating ? "Locating…" : "Use GPS"}</span>
                </button>
              </div>
            </div>

            {/* Right: View Toggle (Grid / Map) & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort By */}
              <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-2xs">
                <ArrowUpDown size={14} className="text-gray-400" />
                <span className="text-gray-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="nearest">Nearest First 📍</option>
                  <option value="rating">Highest Rated ⭐</option>
                  <option value="deliveryFee">Lowest Delivery Fee 🛵</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === "grid"
                      ? "bg-white text-pink-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <LayoutGrid size={15} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === "map"
                      ? "bg-white text-pink-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MapIcon size={15} />
                  <span>Interactive Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Radius Filter Chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-1 text-xs font-bold text-gray-700 mr-1">
              <SlidersHorizontal size={14} className="text-pink-600" /> Distance Radius:
            </span>

            {RADIUS_PRESETS.map((preset) => {
              const active = selectedRadius === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleRadiusSelect(preset.value)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                    active
                      ? "bg-pink-600 text-white shadow-xs shadow-pink-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Only deliverable checkbox */}
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyDeliverable}
                onChange={(e) => setOnlyDeliverable(e.target.checked)}
                className="h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
              />
              <span>Within restaurant delivery radius only</span>
            </label>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 font-semibold transition ${
                    isSelected
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Results Counter & Search Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Found <span className="font-bold text-gray-900">{restaurants.length}</span> restaurant{restaurants.length === 1 ? "" : "s"}
            {hasActiveCoordinates && selectedRadius > 0 && (
              <span> within <strong className="text-pink-600">{selectedRadius} km</strong></span>
            )}
            {activeCategory !== "All" && (
              <span> in <strong className="text-gray-900">{activeCategory}</strong></span>
            )}
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <RestaurantSkeleton />
        ) : restaurants.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <MapPin size={28} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No restaurants found in this area
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {selectedRadius > 0
                ? `There are no active restaurants within ${selectedRadius} km of your selected destination. Try increasing the search radius to 10 km or 25 km.`
                : "No restaurants matched your filters. Try resetting search or category filters."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              {selectedRadius > 0 && selectedRadius < 25 && (
                <button
                  onClick={() => handleRadiusSelect(selectedRadius === 2 ? 5 : 25)}
                  className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  Expand Radius to {selectedRadius === 2 ? "5 km" : "25 km"}
                </button>
              )}
              <button
                onClick={() => {
                  handleCategorySelect("All");
                  handleRadiusSelect(0);
                  setOnlyDeliverable(false);
                }}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : viewMode === "map" ? (
          /* Map View */
          <div className="space-y-6">
            <NearbyMap
              userPosition={
                hasActiveCoordinates ? [effectiveLat, effectiveLng] : null
              }
              userAddress={activeDestinationLabel}
              radius={selectedRadius}
              restaurants={restaurants}
              height="600px"
            />

            {/* List preview beneath map */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Nearby Restaurants List
              </h2>
              <RestaurantGrid
                restaurants={restaurants}
                userLatitude={effectiveLat}
                userLongitude={effectiveLng}
              />
            </div>
          </div>
        ) : (
          /* Grid View */
          <RestaurantGrid
            restaurants={restaurants}
            userLatitude={effectiveLat}
            userLongitude={effectiveLng}
          />
        )}
      </div>

      {/* Destination modal for picking address / GPS / custom point */}
      <DestinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(point) => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("lat", point.latitude);
            next.set("lng", point.longitude);
            next.set("radius", selectedRadius || 5);
            return next;
          });
        }}
      />
    </div>
  );
};

export default Restaurants;
