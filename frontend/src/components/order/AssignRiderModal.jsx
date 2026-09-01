import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Bike, Loader2, MapPin, Phone, RefreshCw, UserCheck } from "lucide-react";

import { getAvailableRidersThunk } from "../../redux/rider/riderThunk";
import {
  formatDistance,
  haversineDistance,
  isValidCoordinate,
} from "../../services/location.service";

/**
 * AssignRiderModal
 * ----------------
 * Lets a restaurant owner or admin pick an available rider for an order.
 * Riders are listed with their current load and, when both positions are
 * known, how far they are from the restaurant.
 */
const AssignRiderModal = ({ open, onClose, order, onAssign, loading }) => {
  const dispatch = useDispatch();
  const { availableRiders, loading: ridersLoading } = useSelector(
    (state) => state.rider
  );

  // The chosen rider is remembered per order, so opening the modal for a
  // different order always starts with nothing selected without needing an
  // effect to reset it.
  const [selection, setSelection] = useState({ orderId: null, riderId: "" });
  const selectedRider =
    selection.orderId === order?._id ? selection.riderId : "";

  const selectRider = (riderId) =>
    setSelection({ orderId: order?._id, riderId });

  useEffect(() => {
    if (open) dispatch(getAvailableRidersThunk());
  }, [open, dispatch]);

  // GeoJSON stores [longitude, latitude]; only present when the order's
  // restaurant was populated with its location.
  const restaurantCoords = order?.restaurant?.location?.coordinates;
  const restaurantPoint = restaurantCoords
    ? { latitude: restaurantCoords[1], longitude: restaurantCoords[0] }
    : null;

  const currentRider = order?.assignedRider;

  const handleSubmit = () => {
    if (!selectedRider) return;
    onAssign(selectedRider);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div className="flex items-center gap-2">
          <Bike size={20} className="text-pink-600" />
          <span className="font-bold">
            {currentRider ? "Reassign Rider" : "Assign Rider"}
          </span>
        </div>
        {order && (
          <p className="mt-1 text-xs font-normal text-gray-500">
            Order {order.orderNumber}
          </p>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {currentRider && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Currently assigned to <strong>{currentRider.name}</strong>. Choosing
            another rider will replace them.
          </div>
        )}

        {order?.riderStatus === "rejected" && order?.riderRejectionReason && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            The previous rider declined: “{order.riderRejectionReason}”
          </div>
        )}

        {ridersLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Loading available riders…
          </div>
        ) : availableRiders.length === 0 ? (
          <div className="py-8 text-center">
            <Bike size={32} className="mx-auto text-gray-300" />
            <p className="mt-3 font-semibold text-gray-700">
              No riders are online right now
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Riders appear here once they mark themselves available.
            </p>
            <button
              type="button"
              onClick={() => dispatch(getAvailableRidersThunk())}
              className="mx-auto mt-4 flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {availableRiders.map((rider) => {
              const isSelected = selectedRider === rider._id;
              const isCurrent = currentRider?._id === rider._id;

              const riderPoint = {
                latitude: rider.currentLocation?.latitude,
                longitude: rider.currentLocation?.longitude,
              };

              const distance =
                restaurantPoint && isValidCoordinate(riderPoint)
                  ? haversineDistance(riderPoint, restaurantPoint)
                  : null;

              return (
                <label
                  key={rider._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    isSelected
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="rider"
                    value={rider._id}
                    checked={isSelected}
                    onChange={() => selectRider(rider._id)}
                    className="mt-1 h-4 w-4 accent-pink-600"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{rider.name}</p>

                      {isCurrent && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                          Current
                        </span>
                      )}

                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                        Online
                      </span>
                    </div>

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1 capitalize">
                        <Bike size={12} className="text-pink-600" />
                        {rider.vehicleType}
                        {rider.vehicleNumber ? ` • ${rider.vehicleNumber}` : ""}
                      </span>

                      {rider.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {rider.phone}
                        </span>
                      )}
                    </p>

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span
                        className={`font-medium ${
                          rider.activeOrders > 0
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {rider.activeOrders > 0
                          ? `${rider.activeOrders} active ${
                              rider.activeOrders === 1 ? "delivery" : "deliveries"
                            }`
                          : "Free right now"}
                      </span>

                      {distance !== null && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin size={12} className="text-pink-600" />
                          {formatDistance(distance)} from restaurant
                        </span>
                      )}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedRider || loading}
          className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserCheck size={16} />
          )}
          {currentRider ? "Reassign" : "Assign Rider"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRiderModal;
