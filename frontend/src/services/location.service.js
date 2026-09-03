/**
 * Location service
 * ----------------
 * One place for everything geo-related in the app:
 *   • Browser GPS (Geolocation API)
 *   • Reverse geocoding + address search (OpenStreetMap Nominatim)
 *   • Driving routes, distance and ETA (OSRM)
 *   • Distance/duration helpers and formatters
 *
 * These are public OpenStreetMap services, so they are called directly from
 * the browser with a plain `fetch` — deliberately NOT through the app's axios
 * instance, which attaches our auth headers and points at our own API.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const OSRM_URL = "https://router.project-osrm.org";

const getCity = (details = {}) =>
  details.city ||
  details.town ||
  details.village ||
  details.municipality ||
  details.city_district ||
  "";

// Fallback map centre (Karachi) used when we have nothing else to show.
export const DEFAULT_CENTER = { latitude: 24.8607, longitude: 67.0011 };

// ═════════════════════════════════════════════════════════════════════
// BROWSER GPS
// ═════════════════════════════════════════════════════════════════════

/**
 * Read the device's current position once.
 * Resolves with { latitude, longitude, accuracy }.
 */
export const getCurrentPosition = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location access."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => reject(new Error(describeGeolocationError(error))),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      }
    );
  });

/**
 * Continuously watch the device position.
 * Returns a function that stops watching — call it on unmount.
 */
export const watchPosition = (onUpdate, onError, options = {}) => {
  if (!navigator.geolocation) {
    onError?.(new Error("Your browser does not support location access."));
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) =>
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      }),
    (error) => onError?.(new Error(describeGeolocationError(error))),
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000,
      ...options,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
};

const describeGeolocationError = (error) => {
  switch (error?.code) {
    case 1:
      return "Location permission denied. Please allow location access and try again.";
    case 2:
      return "Your location is currently unavailable. Please try again.";
    case 3:
      return "Getting your location took too long. Please try again.";
    default:
      return "Could not get your location.";
  }
};

// ═════════════════════════════════════════════════════════════════════
// GEOCODING (Nominatim)
// ═════════════════════════════════════════════════════════════════════

/**
 * Turn coordinates into a human-readable address.
 * Always resolves — on failure it returns the coordinates as the address so
 * the UI never gets stuck waiting on a third-party service.
 */
export const reverseGeocode = async (latitude, longitude) => {
  const fallback = {
    address: `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`,
    city: "",
    postalCode: "",
  };

  try {
    const params = new URLSearchParams({
      format: "json",
      lat: latitude,
      lon: longitude,
      zoom: "18",
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const details = data.address || {};

    return {
      address: data.display_name || fallback.address,
      city: getCity(details),
      postalCode: details.postcode || "",
    };
  } catch {
    return fallback;
  }
};

/**
 * Search for a place by text.
 * Returns [{ label, latitude, longitude, city, postalCode }].
 */
export const searchAddress = async (query, limit = 5) => {
  if (!query || query.trim().length < 3) return [];

  try {
    const params = new URLSearchParams({
      format: "json",
      q: query.trim(),
      limit: String(limit),
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const results = await response.json();

    return results.map((result) => ({
      label: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city: getCity(result.address),
      postalCode: result.address?.postcode || "",
    }));
  } catch {
    return [];
  }
};

// ═════════════════════════════════════════════════════════════════════
// ROUTING (OSRM)
// ═════════════════════════════════════════════════════════════════════

/**
 * Fetch a driving route between two points.
 * Returns { coordinates: [[lat, lng], ...], distance (m), duration (s) }
 * or null when no route could be calculated.
 */
export const getRoute = async (from, to) => {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) return null;

  try {
    // OSRM expects lng,lat pairs
    const path = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;

    const response = await fetch(
      `${OSRM_URL}/route/v1/driving/${path}?overview=full&geometries=geojson`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route) return null;

    return {
      // Leaflet wants [lat, lng]; GeoJSON gives [lng, lat].
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
};

// ═════════════════════════════════════════════════════════════════════
// MATH & FORMATTING HELPERS
// ═════════════════════════════════════════════════════════════════════

export const isValidCoordinate = (point) =>
  Boolean(point) &&
  Number.isFinite(Number(point.latitude)) &&
  Number.isFinite(Number(point.longitude)) &&
  Number(point.latitude) >= -90 &&
  Number(point.latitude) <= 90 &&
  Number(point.longitude) >= -180 &&
  Number(point.longitude) <= 180;

/** Straight-line distance in metres — used when OSRM is unavailable. */
export const haversineDistance = (from, to) => {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) return 0;

  const EARTH_RADIUS = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (metres) => {
  if (!Number.isFinite(metres) || metres <= 0) return "—";
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

  const minutes = Math.round(seconds / 60);

  if (minutes < 1) return "Less than a minute";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`;
};

/** Clock time the rider is expected to arrive, e.g. "8:45 PM". */
export const formatEta = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

  const arrival = new Date(Date.now() + seconds * 1000);

  return arrival.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};
