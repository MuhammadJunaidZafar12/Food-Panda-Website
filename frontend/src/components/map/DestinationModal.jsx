import { useState, useEffect } from "react";
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Loader2,
  Sliders,
  Check,
} from "lucide-react";
import { searchAddress } from "../../services/location.service";
import useUserLocation from "../../hooks/useUserLocation";

const RADIUS_OPTIONS = [2, 5, 10, 15, 25];

const DestinationModal = ({ isOpen, onClose, onSelect }) => {
  const {
    latitude,
    longitude,
    address,
    city,
    radius,
    locateUser,
    isLocating,
    updateDestination,
    updateRadius,
    hasCoordinates,
  } = useUserLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(radius || 5);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    setSelectedRadius(radius || 5);
  }, [radius]);

  // Debounced search for addresses
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const list = await searchAddress(trimmed, 5);
        if (!cancelled) setResults(list);
      } catch (err) {
        console.error("Address search error", err);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  const handleGpsClick = async () => {
    setGpsError("");
    try {
      const loc = await locateUser();
      if (onSelect) onSelect(loc);
      onClose();
    } catch (err) {
      setGpsError(err.message || "Failed to get GPS location.");
    }
  };

  const handleSelectResult = (item) => {
    updateDestination({
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.label,
      city: item.city,
      radius: selectedRadius,
      isCustom: true,
    });
    setQuery("");
    setResults([]);
    if (onSelect) onSelect(item);
    onClose();
  };

  const handleRadiusChange = (r) => {
    setSelectedRadius(r);
    updateRadius(r);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Select Destination
              </h3>
              <p className="text-xs text-gray-500">
                Find restaurants within your desired radius
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Quick GPS Button */}
          <button
            onClick={handleGpsClick}
            disabled={isLocating}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-pink-600 bg-pink-50/70 py-3 font-semibold text-pink-600 transition hover:bg-pink-100 active:scale-[0.99] disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 size={18} className="animate-spin text-pink-600" />
            ) : (
              <Crosshair size={18} className="text-pink-600" />
            )}
            <span>
              {isLocating
                ? "Locating your device…"
                : "Use Current Device GPS"}
            </span>
          </button>

          {gpsError && (
            <p className="text-xs font-medium text-red-600">{gpsError}</p>
          )}

          {/* Search Input */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Or search address / landmark
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Clifton, Gulshan-e-Iqbal, DHA Phase 5..."
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results dropdown */}
            {(searching || results.length > 0) && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                {searching && (
                  <div className="flex items-center gap-2 p-3 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin text-pink-600" />
                    Searching places…
                  </div>
                )}
                {!searching &&
                  results.map((res, idx) => (
                    <button
                      key={`${res.latitude}-${res.longitude}-${idx}`}
                      type="button"
                      onClick={() => handleSelectResult(res)}
                      className="flex w-full items-start gap-2.5 border-b border-gray-50 p-3 text-left text-xs text-gray-800 transition hover:bg-pink-50/70"
                    >
                      <MapPin size={15} className="shrink-0 text-pink-600 mt-0.5" />
                      <span className="line-clamp-2">{res.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Radius Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Sliders size={14} className="text-pink-600" /> Nearby Search Radius
              </label>
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-700">
                {selectedRadius} km
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRadiusChange(r)}
                  className={`rounded-xl py-2 text-xs font-bold transition ${
                    selectedRadius === r
                      ? "bg-pink-600 text-white shadow-md shadow-pink-200"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Current Saved Destination */}
          {hasCoordinates && (
            <div className="rounded-xl border border-pink-100 bg-pink-50/40 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Currently set destination:
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                      {address || `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-pink-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200 hover:bg-pink-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationModal;
