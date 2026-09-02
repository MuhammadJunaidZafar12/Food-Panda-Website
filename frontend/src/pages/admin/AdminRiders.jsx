import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  Ban,
  Bike,
  CheckCircle2,
  ExternalLink,
  Map as MapIcon,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { getAllRidersThunk } from "../../redux/rider/riderThunk";
import { clearRiderError } from "../../redux/rider/riderSlice";
import { riderIcon } from "../../components/map/mapIcons";
import timeAgo from "../../utils/timeAgo";

/**
 * AdminRiders
 * -----------
 * Directory of every delivery rider on the platform: who is online, what they
 * ride, how loaded they are and where their last GPS ping came from.
 *
 * Assigning a rider to an order happens on the orders screens (a rider only
 * makes sense in the context of one order), so this page links across to them.
 */

const availabilityTabs = [
  { id: "all", label: "All Riders" },
  { id: "available", label: "Online" },
  { id: "unavailable", label: "Offline" },
];

// Leaflet measures its container on mount; inside a dialog that happens before
// the dialog has finished opening, so the tiles need a nudge afterwards.
const ResizeOnOpen = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
    >
      <Icon size={22} />
    </div>
    <div>
      <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="text-xl font-extrabold text-gray-900">{value}</span>
    </div>
  </div>
);

const AdminRiders = () => {
  const dispatch = useDispatch();

  const { riders = [], loading, error } = useSelector((state) => state.rider);

  const [availability, setAvailability] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mapRider, setMapRider] = useState(null);

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(getAllRidersThunk({ availability, search: debouncedSearch }));
  }, [dispatch, availability, debouncedSearch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRiderError());
    }
  }, [error, dispatch]);

  const summary = useMemo(
    () => ({
      total: riders.length,
      online: riders.filter((r) => r.isAvailable && !r.isBlocked).length,
      onDelivery: riders.filter((r) => (r.activeOrders || 0) > 0).length,
      blocked: riders.filter((r) => r.isBlocked).length,
    }),
    [riders]
  );

  const refresh = () =>
    dispatch(getAllRidersThunk({ availability, search: debouncedSearch }));

  const mapLatitude = mapRider?.currentLocation?.latitude;
  const mapLongitude = mapRider?.currentLocation?.longitude;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Manage Riders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Availability, current load and last known GPS position of every
            rider.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800"
          >
            <ShoppingBag size={14} />
            Assign from Orders
          </Link>

          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Riders"
          value={summary.total}
          tone="bg-pink-50 text-pink-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Online Now"
          value={summary.online}
          tone="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Bike}
          label="On A Delivery"
          value={summary.onDelivery}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Ban}
          label="Blocked"
          value={summary.blocked}
          tone="bg-red-50 text-red-600"
        />
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-pink-600 focus:ring-1 focus:ring-pink-600"
          />
        </div>
      </div>

      {/* Availability tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-gray-200 pb-px">
        {availabilityTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAvailability(tab.id)}
            className={`cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 text-xs font-bold uppercase tracking-wider transition ${
              availability === tab.id
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rider list */}
      {loading && riders.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-white"
            />
          ))}
        </div>
      ) : riders.length === 0 ? (
        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <Bike size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">No riders found</h3>
            <p className="mx-auto max-w-xs text-sm text-gray-500">
              {debouncedSearch
                ? "No rider matched your search."
                : "Create a user with the rider role to start assigning deliveries."}
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-pink-700"
          >
            <Users size={14} />
            Manage Users
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            {/* min-width keeps the columns readable on phones — the wrapper
                scrolls instead of squashing them. */}
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Rider</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4">Deliveries</th>
                  <th className="px-6 py-4">Live Location</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {riders.map((rider) => {
                  const latitude = rider.currentLocation?.latitude;
                  const longitude = rider.currentLocation?.longitude;
                  const hasLocation =
                    Number.isFinite(latitude) && Number.isFinite(longitude);

                  return (
                    <tr key={rider._id} className="transition hover:bg-gray-50/50">
                      {/* Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700">
                            {rider.name?.charAt(0)?.toUpperCase() || "R"}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-semibold text-gray-900">
                              {rider.name}
                            </span>
                            {rider.isBlocked && (
                              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                <Ban size={10} />
                                Blocked
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <span className="block text-xs text-gray-500">
                          {rider.email}
                        </span>
                        {rider.phone && (
                          <a
                            href={`tel:${rider.phone}`}
                            className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-gray-700 transition hover:text-pink-600"
                          >
                            <Phone size={11} />
                            {rider.phone}
                          </a>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 font-semibold capitalize text-gray-900">
                          <Bike size={14} className="text-pink-600" />
                          {rider.vehicleType || "—"}
                        </span>
                        {rider.vehicleNumber && (
                          <span className="mt-0.5 block font-mono text-xs text-gray-400">
                            {rider.vehicleNumber}
                          </span>
                        )}
                      </td>

                      {/* Availability */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                            rider.isAvailable && !rider.isBlocked
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              rider.isAvailable && !rider.isBlocked
                                ? "animate-pulse bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          {rider.isAvailable && !rider.isBlocked
                            ? "Online"
                            : "Offline"}
                        </span>
                      </td>

                      {/* Load */}
                      <td className="px-6 py-4">
                        <span className="block font-bold text-gray-900">
                          {rider.activeOrders || 0} active
                        </span>
                        <span className="text-xs text-gray-400">
                          {rider.totalDeliveries || 0} delivered
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        {hasLocation ? (
                          <div className="space-y-1">
                            <span className="flex items-center gap-1 font-mono text-xs text-gray-700">
                              <MapPin size={11} className="text-green-600" />
                              {latitude.toFixed(4)}, {longitude.toFixed(4)}
                            </span>
                            <span className="block text-[11px] text-gray-400">
                              Updated {timeAgo(rider.currentLocation?.updatedAt)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMapRider(rider)}
                              className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] font-bold text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
                            >
                              <MapIcon size={12} />
                              View on map
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Not shared yet
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rider location map */}
      <Dialog
        open={Boolean(mapRider)}
        onClose={() => setMapRider(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px" } }}
      >
        {mapRider && (
          <>
            <DialogTitle className="flex items-center justify-between border-b border-gray-100 font-bold text-gray-900">
              <div>
                <span className="block text-lg">{mapRider.name}</span>
                <span className="text-xs font-normal text-gray-500">
                  Last GPS ping {timeAgo(mapRider.currentLocation?.updatedAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMapRider(null)}
                className="text-gray-400 transition hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </DialogTitle>

            <DialogContent className="p-0">
              <div className="h-80 w-full">
                <MapContainer
                  center={[mapLatitude, mapLongitude]}
                  zoom={15}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ResizeOnOpen />
                  <Marker
                    position={[mapLatitude, mapLongitude]}
                    icon={riderIcon}
                  >
                    <Popup>
                      <p className="font-semibold">{mapRider.name}</p>
                      <p className="text-xs capitalize text-gray-600">
                        {mapRider.vehicleType || "bike"}
                        {mapRider.vehicleNumber
                          ? ` • ${mapRider.vehicleNumber}`
                          : ""}
                      </p>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Coordinates
                  </span>
                  <span className="font-mono text-sm text-gray-800">
                    {mapLatitude?.toFixed(6)}, {mapLongitude?.toFixed(6)}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapLatitude},${mapLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  <ExternalLink size={13} />
                  Open in Google Maps
                </a>
              </div>
            </DialogContent>

            <DialogActions className="gap-2 border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={() => setMapRider(null)}
                className="cursor-pointer rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default AdminRiders;
