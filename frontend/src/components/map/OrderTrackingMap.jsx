import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import { Bike, Clock, Route as RouteIcon } from "lucide-react";

import {
  DEFAULT_CENTER,
  formatDistance,
  formatDuration,
  getRoute,
  haversineDistance,
  isValidCoordinate,
} from "../../services/location.service";
import { customerIcon, restaurantIcon, riderIcon } from "./mapIcons";

/**
 * OrderTrackingMap
 * ----------------
 * Live delivery map for a single order. Plots the restaurant, the customer's
 * delivery point and the rider's current GPS position, draws the driving route
 * between the relevant pair, and reports distance + ETA.
 *
 * Once the food has been picked up the route is drawn from the rider to the
 * customer; before that it shows the restaurant-to-customer trip.
 */

// After these statuses the rider is carrying the order.
const CARRYING_STATUSES = ["picked_up", "out_for_delivery"];
const FINISHED_STATUSES = ["delivered", "cancelled", "rejected"];

// ── Helper to extract valid { latitude, longitude } from various object formats ──
const extractPoint = (point) => {
  if (!point) return null;

  // 1. Direct valid coordinates
  if (isValidCoordinate(point)) {
    return {
      ...point,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
    };
  }

  // 2. Nested currentLocation (e.g. rider user model)
  if (point.currentLocation && isValidCoordinate(point.currentLocation)) {
    return {
      ...point,
      latitude: Number(point.currentLocation.latitude),
      longitude: Number(point.currentLocation.longitude),
    };
  }

  // 3. Nested deliveryLocation (e.g. order deliveryLocation)
  if (point.deliveryLocation && isValidCoordinate(point.deliveryLocation)) {
    return {
      ...point,
      latitude: Number(point.deliveryLocation.latitude),
      longitude: Number(point.deliveryLocation.longitude),
    };
  }

  // 4. GeoJSON location: { coordinates: [lng, lat] }
  const coords = point.location?.coordinates || point.coordinates;
  if (
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(Number(coords[0])) &&
    Number.isFinite(Number(coords[1]))
  ) {
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        ...point,
        latitude: lat,
        longitude: lng,
      };
    }
  }

  return null;
};

// ── Fit the view to every known point ────────────────────────────────
const FitBounds = ({ points, signature }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    map.fitBounds(points, { padding: [45, 45], maxZoom: 16 });
    // Re-fit only when the *set* of points changes, not on every GPS nudge,
    // otherwise the map would jump around while the rider moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    const interval = setInterval(() => map.invalidateSize(), 1500);
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
};

const OrderTrackingMap = ({
  restaurant,
  delivery,
  rider,
  orderStatus,
  height = 380,
  onRouteChange,
}) => {
  const [route, setRoute] = useState(null);

  // Kept in a ref so the parent can pass an inline callback without that
  // re-triggering the route lookup on every render.
  const routeCallback = useRef(onRouteChange);
  useEffect(() => {
    routeCallback.current = onRouteChange;
  }, [onRouteChange]);

  const restaurantPoint = extractPoint(restaurant);
  const customerPoint = extractPoint(delivery);
  const riderPoint = extractPoint(rider);

  const isCarrying =
    Boolean(riderPoint) && CARRYING_STATUSES.includes(orderStatus);

  // Which leg of the journey the route should describe.
  const origin = isCarrying ? riderPoint : restaurantPoint;
  const destination = customerPoint;
  const legLabel = isCarrying ? "Rider → You" : "Restaurant → You";

  const points = useMemo(() => {
    const list = [];
    if (restaurantPoint)
      list.push([restaurantPoint.latitude, restaurantPoint.longitude]);
    if (customerPoint)
      list.push([customerPoint.latitude, customerPoint.longitude]);
    if (riderPoint) list.push([riderPoint.latitude, riderPoint.longitude]);
    return list;
  }, [restaurantPoint, customerPoint, riderPoint]);

  // Changes only when a marker appears or disappears.
  const boundsSignature = [
    restaurantPoint ? 1 : 0,
    customerPoint ? 1 : 0,
    riderPoint ? 1 : 0,
  ].join("");

  const originLat = origin?.latitude;
  const originLng = origin?.longitude;
  const destLat = destination?.latitude;
  const destLng = destination?.longitude;

  // Both ends of the leg have to be known before a route can be drawn.
  const hasLeg = Number.isFinite(originLat) && Number.isFinite(destLat);

  // ── Fetch the driving route whenever either endpoint moves ─────────
  useEffect(() => {
    if (!hasLeg) {
      // Nothing to route between — let the page hide its distance/ETA panel.
      routeCallback.current?.(null);
      return;
    }

    let cancelled = false;

    const from = { latitude: originLat, longitude: originLng };
    const to = { latitude: destLat, longitude: destLng };

    const load = async () => {
      const result = await getRoute(from, to);

      if (cancelled) return;

      // If OSRM is unreachable, fall back to a straight line and a rough
      // 25 km/h city-riding estimate so the UI still shows something useful.
      const resolved =
        result ||
        (() => {
          const distance = haversineDistance(from, to);
          return {
            coordinates: [
              [from.latitude, from.longitude],
              [to.latitude, to.longitude],
            ],
            distance,
            duration: (distance / 1000 / 25) * 3600,
            estimated: true,
          };
        })();

      setRoute(resolved);
      routeCallback.current?.(resolved);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [hasLeg, originLat, originLng, destLat, destLng]);

  const center = points[0] || [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude];

  // `route` may still hold the previous leg, so it is only trusted while both
  // endpoints are known and the order is still on its way.
  const showRoute =
    hasLeg && route && !FINISHED_STATUSES.includes(orderStatus);

  if (points.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center"
        style={{ height }}
      >
        <RouteIcon size={28} className="text-gray-400" />
        <p className="text-sm font-medium text-gray-600">
          Map not available for this order
        </p>
        <p className="text-xs text-gray-500">
          No delivery coordinates were saved with it.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-200"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points} signature={boundsSignature} />

        {showRoute && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{
              color: "#e21b70",
              weight: 5,
              opacity: 0.75,
              dashArray: route.estimated ? "8 10" : undefined,
            }}
          />
        )}

        {restaurantPoint && (
          <Marker
            position={[restaurantPoint.latitude, restaurantPoint.longitude]}
            icon={restaurantIcon}
          >
            <Popup>
              <p className="font-semibold">{restaurant.name || "Restaurant"}</p>
              {restaurant.address && (
                <p className="text-xs text-gray-600">{restaurant.address}</p>
              )}
            </Popup>
          </Marker>
        )}

        {customerPoint && (
          <Marker
            position={[customerPoint.latitude, customerPoint.longitude]}
            icon={customerIcon}
          >
            <Popup>
              <p className="font-semibold">Delivery address</p>
              {delivery.address && (
                <p className="text-xs text-gray-600">{delivery.address}</p>
              )}
            </Popup>
          </Marker>
        )}

        {riderPoint && (
          <Marker
            position={[riderPoint.latitude, riderPoint.longitude]}
            icon={riderIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <p className="font-semibold">{rider.name || "Your rider"}</p>
              <p className="text-xs text-gray-600">
                {rider.vehicleType}
                {rider.vehicleNumber ? ` • ${rider.vehicleNumber}` : ""}
              </p>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Distance / ETA overlay */}
      {showRoute && (
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <Bike size={12} className="text-pink-600" />
            {legLabel}
          </p>
          <div className="mt-1 flex items-center gap-3 text-sm font-semibold text-gray-800">
            <span className="flex items-center gap-1">
              <RouteIcon size={14} className="text-pink-600" />
              {formatDistance(route.distance)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-pink-600" />
              {formatDuration(route.duration)}
            </span>
          </div>
          {route.estimated && (
            <p className="mt-0.5 text-[10px] text-gray-500">Approximate</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTrackingMap;
