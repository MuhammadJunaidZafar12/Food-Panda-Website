import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, MapPin, MapPinOff, Power } from "lucide-react";
import toast from "react-hot-toast";

import RiderSidebar from "./RiderSidebar";
import {
  getMyRiderStatsThunk,
  updateMyAvailabilityThunk,
} from "../../redux/rider/riderThunk";
import { clearRiderError, clearRiderSuccess } from "../../redux/rider/riderSlice";
import useLiveLocation from "../../hooks/useLiveLocation";

/**
 * RiderLayout
 * -----------
 * Wraps every rider page. The online/offline switch and the GPS stream live
 * here so a rider keeps sharing their position while they move between the
 * dashboard, their delivery list and an individual delivery.
 */
const RiderLayout = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { isAvailable, actionLoading, error, success, message } = useSelector(
    (state) => state.rider
  );

  // Load the rider's saved availability once so the switch survives a reload.
  useEffect(() => {
    dispatch(getMyRiderStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRiderError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearRiderSuccess());
    }
  }, [success, message, dispatch]);

  // Only share GPS while the rider is online.
  const { position, error: gpsError } = useLiveLocation(isAvailable);

  const toggleAvailability = () => {
    dispatch(updateMyAvailabilityThunk(!isAvailable));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RiderSidebar />

      <div className="min-w-0 flex-1">
        <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
                {user?.name ? `Hi, ${user.name}` : "Rider Dashboard"}
              </h1>
              <p className="text-xs text-gray-500 sm:text-sm">
                {isAvailable
                  ? "You're online — new deliveries can be assigned to you."
                  : "You're offline — go online to receive deliveries."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* GPS indicator */}
              {isAvailable && (
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${
                    position
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                  title={gpsError || undefined}
                >
                  {position ? <MapPin size={13} /> : <MapPinOff size={13} />}
                  <span className="hidden sm:inline">
                    {position ? "GPS live" : "Waiting for GPS"}
                  </span>
                </span>
              )}

              {/* Online / offline switch */}
              <button
                type="button"
                onClick={toggleAvailability}
                disabled={actionLoading}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isAvailable
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Power size={16} />
                )}
                {isAvailable ? "Online" : "Offline"}
              </button>
            </div>
          </div>

          {isAvailable && gpsError && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {gpsError} Customers can still see your status, but not your live
              position on the map.
            </p>
          )}
        </header>

        {/* Bottom padding keeps content clear of the mobile navigation bar. */}
        <main className="p-4 pb-24 sm:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RiderLayout;
