import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { Link } from "react-router-dom";
import { Star, Clock, Bike, MapPin, ExternalLink } from "lucide-react";
import { DEFAULT_CENTER, formatDistance } from "../../services/location.service";
import { restaurantIcon, userDestinationIcon } from "../map/mapIcons";

// Recenter and fit map bounds to include user location and all restaurants
const MapBoundsHandler = ({ userPosition, restaurants, radius }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Small delay to ensure container sizing is ready
    const timer = setTimeout(() => {
      map.invalidateSize();

      const boundsPoints = [];

      if (userPosition) {
        boundsPoints.push(userPosition);
      }

      restaurants.forEach((r) => {
        const coords = r?.location?.coordinates;
        if (
          Array.isArray(coords) &&
          coords.length === 2 &&
          Number.isFinite(coords[1]) &&
          Number.isFinite(coords[0])
        ) {
          boundsPoints.push([coords[1], coords[0]]);
        }
      });

      if (boundsPoints.length > 1) {
        map.fitBounds(boundsPoints, { padding: [50, 50], maxZoom: 15 });
      } else if (userPosition) {
        map.setView(userPosition, radius <= 5 ? 14 : 12);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [map, userPosition, restaurants, radius]);

  return null;
};

const NearbyMap = ({
  userPosition, // [latitude, longitude] or null
  userAddress = "",
  radius = 5, // in km
  restaurants = [],
  height = "520px",
}) => {
  const defaultPos = userPosition || [
    DEFAULT_CENTER.latitude,
    DEFAULT_CENTER.longitude,
  ];

  const radiusInMeters = (Number(radius) || 5) * 1000;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg"
      style={{ height }}
    >
      <MapContainer
        center={defaultPos}
        zoom={userPosition ? 13 : 11}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsHandler
          userPosition={userPosition}
          restaurants={restaurants}
          radius={radius}
        />

        {/* User Destination Marker & Radius Circle */}
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userDestinationIcon}>
              <Popup>
                <div className="p-1 text-center font-sans">
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-pink-600">
                    <MapPin size={13} /> Your Location / Destination
                  </div>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {userAddress || "Target Destination"}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-gray-500">
                    Searching within {radius} km
                  </p>
                </div>
              </Popup>
            </Marker>

            {radius && radius > 0 && (
              <Circle
                center={userPosition}
                radius={radiusInMeters}
                pathOptions={{
                  color: "#e21b70",
                  fillColor: "#e21b70",
                  fillOpacity: 0.08,
                  weight: 2,
                  dashArray: "6, 8",
                }}
              />
            )}
          </>
        )}

        {/* Restaurant Markers */}
        {restaurants.map((rest) => {
          const coords = rest?.location?.coordinates;
          if (
            !Array.isArray(coords) ||
            coords.length !== 2 ||
            !Number.isFinite(coords[0]) ||
            !Number.isFinite(coords[1])
          ) {
            return null;
          }

          const restPos = [coords[1], coords[0]]; // [lat, lng]
          const distanceStr =
            rest.distance !== undefined
              ? formatDistance(rest.distance)
              : null;

          return (
            <Marker key={rest._id} position={restPos} icon={restaurantIcon}>
              <Popup className="custom-restaurant-popup">
                <div className="w-56 font-sans">
                  {rest.banner ? (
                    <div className="relative h-24 w-full overflow-hidden rounded-t-lg bg-gray-100">
                      <img
                        src={rest.banner}
                        alt={rest.name}
                        className="h-full w-full object-cover"
                      />
                      {rest.rating > 0 && (
                        <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold shadow">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>{rest.rating}</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="p-2.5">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">
                      {rest.name}
                    </h4>
                    <p className="text-xs text-gray-500">{rest.category}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                      {distanceStr && (
                        <span className="flex items-center gap-1 rounded bg-pink-50 px-1.5 py-0.5 font-semibold text-pink-700">
                          <MapPin size={11} />
                          {distanceStr}
                        </span>
                      )}
                      {rest.deliveryFee !== undefined && (
                        <span className="flex items-center gap-0.5">
                          <Bike size={11} /> Rs. {rest.deliveryFee}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/restaurants/${rest._id}`}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-pink-600 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-pink-700"
                    >
                      View Menu <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
        <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pink-600 animate-pulse"></span>
          Showing {restaurants.length} restaurant{restaurants.length === 1 ? "" : "s"} within {radius} km
        </p>
      </div>
    </div>
  );
};

export default NearbyMap;
