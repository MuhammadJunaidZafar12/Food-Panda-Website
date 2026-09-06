import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react";

import {
  DEFAULT_CENTER,
  getCurrentPosition,
  isValidCoordinate,
  reverseGeocode,
  searchAddress,
} from "../../services/location.service";
import { pickerIcon } from "./mapIcons";

/**
 * LocationPicker
 * --------------
 * Reusable map input used anywhere the app needs real coordinates:
 * the checkout delivery address and the restaurant address form.
 *
 * Pick a point by clicking the map, dragging the pin, searching for an
 * address, or tapping "Use my location". Every change is reported through
 * `onChange` as:
 *
 *   { latitude, longitude, address, city, postalCode, resolving }
 *
 * A pick fires `onChange` twice: once straight away with the coordinates and
 * `resolving: true` so the pin moves without waiting on the network, then again
 * with the address and city filled in. Consumers that mirror the address into
 * their own fields should leave them alone while `resolving` is true.
 *
 * The component is fully controlled — it renders whatever `value` holds.
 */

// ── Click anywhere on the map to move the pin ────────────────────────
const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
};

// ── Keep the view centred on the selected point ──────────────────────
const Recenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
  }, [position, map]);

  // Maps rendered inside dialogs or tabs can mount at zero size.
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const LocationPicker = ({
  value,
  onChange,
  height = 300,
  label = "Pick the exact location on the map",
  helperText = "Click the map, drag the pin, or use your current location.",
  showSearch = true,
  disabled = false,
}) => {
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Guards against a slow reverse-geocode overwriting a newer pick.
  const requestRef = useRef(0);

  const hasPosition = isValidCoordinate(value);
  const position = hasPosition
    ? [Number(value.latitude), Number(value.longitude)]
    : null;
  const center = position || [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude];

  // ── Report a new pick upward, filling in the address afterwards ────
  const commit = useCallback(
    async (latitude, longitude, known) => {
      setError("");

      if (known?.address) {
        onChange?.({
          latitude,
          longitude,
          address: known.address,
          city: known.city || "",
          postalCode: known.postalCode || "",
          resolving: false,
        });
        return;
      }

      const requestId = ++requestRef.current;

      // Move the pin immediately, then fill in the address once it arrives.
      onChange?.({
        latitude,
        longitude,
        address: "",
        city: "",
        postalCode: "",
        resolving: true,
      });
      setResolving(true);

      const info = await reverseGeocode(latitude, longitude);

      // A newer pick happened while we were waiting — discard this result.
      if (requestId !== requestRef.current) return;

      onChange?.({ latitude, longitude, ...info, resolving: false });
      setResolving(false);
    },
    [onChange]
  );

  const handlePick = useCallback(
    (latitude, longitude) => {
      if (disabled) return;
      commit(latitude, longitude);
    },
    [commit, disabled]
  );

  // ── Device GPS ────────────────────────────────────────────────────
  const handleUseMyLocation = async () => {
    if (disabled) return;

    setLocating(true);
    setError("");

    try {
      const { latitude, longitude } = await getCurrentPosition();
      await commit(latitude, longitude);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocating(false);
    }
  };

  // ── Debounced address search ───────────────────────────────────────
  const trimmedQuery = query.trim();
  const canSearch = showSearch && trimmedQuery.length >= 3;

  useEffect(() => {
    if (!canSearch) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);

      const found = await searchAddress(trimmedQuery);

      // The query moved on while Nominatim was answering — drop this result.
      if (cancelled) return;

      setResults(found);
      setSearching(false);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery, canSearch]);

  const handleSelectResult = (result) => {
    setQuery("");
    setResults([]);
    commit(result.latitude, result.longitude, {
      address: result.label,
      city: result.city,
      postalCode: result.postalCode,
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <MapPin size={16} className="text-pink-600" />
            {label}
          </p>
        )}

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={disabled || locating}
          className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Crosshair size={14} />
          )}
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      {/* Address search */}
      {showSearch && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled}
            placeholder="Search for an area, street or landmark…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-100"
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

          {/* Results are only meaningful while the query is long enough to
              have been searched for. */}
          {canSearch && (searching || results.length > 0) && (
            <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {searching && (
                <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Searching…
                </li>
              )}

              {!searching &&
                results.map((result, index) => (
                  <li key={`${result.latitude}-${result.longitude}-${index}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-pink-50"
                    >
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-pink-600"
                      />
                      <span className="line-clamp-2">{result.label}</span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* Map */}
      <div
        className="relative overflow-hidden rounded-xl border border-gray-200"
        style={{ height }}
      >
        <MapContainer 
          center={center}
          zoom={hasPosition ? 16 : 12}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={handlePick} />
          <Recenter position={position} />

          {position && (
            <Marker
              position={position}
              icon={pickerIcon}
              draggable={!disabled}
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng();
                  handlePick(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>

        {!hasPosition && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-center text-xs font-medium text-white">
              Tap anywhere on the map to drop your pin
            </p>
          </div>
        )}
      </div>

      {/* Selected location summary */}
      {hasPosition && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-pink-600" />
            <div className="min-w-0 flex-1">
              {resolving ? (
                <p className="flex items-center gap-2 text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Looking up address…
                </p>
              ) : (
                <p className="break-words text-gray-800">
                  {value.address || "Address unavailable for this point"}
                </p>
              )}

              <p className="mt-1 text-xs text-gray-500">
                {Number(value.latitude).toFixed(5)},{" "}
                {Number(value.longitude).toFixed(5)}
                {value.city ? ` • ${value.city}` : ""}
                {value.postalCode ? ` • ${value.postalCode}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export default LocationPicker;
