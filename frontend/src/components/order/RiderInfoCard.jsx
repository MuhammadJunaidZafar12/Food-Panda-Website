import { Bike, MapPin, Phone, User } from "lucide-react";

import timeAgo from "../../utils/timeAgo";

/**
 * RiderInfoCard
 * -------------
 * Shows who is delivering an order. Accepts a rider from either shape the API
 * returns: a populated user document (`currentLocation: { … }`) or the flat
 * tracking payload (`latitude` / `longitude`).
 */

const riderStatusLabels = {
  unassigned: { label: "No rider yet", className: "bg-gray-100 text-gray-600" },
  assigned: {
    label: "Awaiting rider confirmation",
    className: "bg-amber-50 text-amber-700",
  },
  accepted: {
    label: "Rider on the job",
    className: "bg-green-50 text-green-700",
  },
  rejected: {
    label: "Rider declined — reassigning",
    className: "bg-red-50 text-red-700",
  },
};

const RiderInfoCard = ({ rider, riderStatus, title = "Your Rider" }) => {
  if (!rider) {
    const status = riderStatusLabels[riderStatus] || riderStatusLabels.unassigned;

    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            <p className="text-xs text-gray-500">{status.label}</p>
          </div>
        </div>
      </div>
    );
  }

  const latitude = rider.latitude ?? rider.currentLocation?.latitude ?? null;
  const longitude = rider.longitude ?? rider.currentLocation?.longitude ?? null;
  const updatedAt =
    rider.locationUpdatedAt ?? rider.currentLocation?.updatedAt ?? null;

  const status = riderStatus ? riderStatusLabels[riderStatus] : null;
  const lastSeen = timeAgo(updatedAt);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-base font-bold text-pink-700">
            {rider.name?.charAt(0)?.toUpperCase() || "R"}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{rider.name}</p>
            <p className="flex items-center gap-1.5 text-xs capitalize text-gray-500">
              <Bike size={12} className="text-pink-600" />
              {rider.vehicleType || "bike"}
              {rider.vehicleNumber ? ` • ${rider.vehicleNumber}` : ""}
            </p>
          </div>
        </div>

        {rider.phone && (
          <a
            href={`tel:${rider.phone}`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
          >
            <Phone size={14} />
            <span className="hidden sm:inline">Call</span>
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        )}

        {latitude !== null && longitude !== null ? (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            <MapPin size={11} className="text-green-600" />
            Location updated {lastSeen}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
            Live location not shared yet
          </span>
        )}
      </div>
    </div>
  );
};

export default RiderInfoCard;
