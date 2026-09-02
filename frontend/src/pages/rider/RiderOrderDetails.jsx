import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Banknote,
  Bike,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Store,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getOrderByIdThunk,
  getOrderTrackingThunk,
} from "../../redux/order/orderThunk";
import { clearCurrentOrder, clearTracking } from "../../redux/order/orderSlice";
import {
  respondToAssignmentThunk,
  updateDeliveryStatusThunk,
} from "../../redux/rider/riderThunk";
import useOrderSocket from "../../hooks/useOrderSocket";
import OrderTrackingMap from "../../components/map/OrderTrackingMap";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderTimeline from "../../components/order/OrderTimeline";
import OrderItemRow from "../../components/order/OrderItemRow";
import RejectDeliveryModal from "../../components/rider/RejectDeliveryModal";
import {
  formatDistance,
  formatDuration,
} from "../../services/location.service";

// The only moves a rider can make, in order.
const NEXT_STEP = {
  ready: {
    status: "picked_up",
    label: "I've Picked It Up",
    icon: Store,
  },
  picked_up: {
    status: "out_for_delivery",
    label: "Start Delivery",
    icon: Bike,
  },
  out_for_delivery: {
    status: "delivered",
    label: "Mark as Delivered",
    icon: CheckCircle2,
  },
};

const WAITING_MESSAGES = {
  accepted: "Waiting for the restaurant to start preparing this order.",
  preparing: "The restaurant is preparing the order. Head over for pickup.",
};

// Opens the device's map app with turn-by-turn directions.
const directionsUrl = (latitude, longitude) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

const RiderOrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder, tracking, loading } = useSelector((state) => state.order);
  const { actionLoading, lastKnownLocation } = useSelector((state) => state.rider);

  const [route, setRoute] = useState(null);
  const [openReject, setOpenReject] = useState(false);

  const load = useCallback(() => {
    dispatch(getOrderByIdThunk(id));
    dispatch(getOrderTrackingThunk(id));
  }, [dispatch, id]);

  useEffect(() => {
    load();

    return () => {
      dispatch(clearCurrentOrder());
      dispatch(clearTracking());
    };
  }, [load, dispatch]);

  useOrderSocket(id);

  // Prefer the position this device just reported — it is fresher than the copy
  // the server sent with the tracking payload.
  const riderForMap = useMemo(() => {
    if (!tracking?.rider) return null;

    if (lastKnownLocation?.latitude && lastKnownLocation?.longitude) {
      return {
        ...tracking.rider,
        latitude: lastKnownLocation.latitude,
        longitude: lastKnownLocation.longitude,
        locationUpdatedAt: lastKnownLocation.updatedAt,
      };
    }

    return tracking.rider;
  }, [tracking, lastKnownLocation]);

  const handleRouteChange = useCallback((next) => setRoute(next), []);

  const handleAccept = async () => {
    try {
      await dispatch(
        respondToAssignmentThunk({ orderId: id, action: "accept" })
      ).unwrap();
      toast.success("Delivery accepted.");
      load();
    } catch (err) {
      toast.error(err || "Failed to accept this delivery.");
    }
  };

  const handleReject = async (reason) => {
    try {
      await dispatch(
        respondToAssignmentThunk({ orderId: id, action: "reject", reason })
      ).unwrap();
      toast.success("Delivery rejected. The restaurant can assign someone else.");
      navigate("/rider/deliveries");
    } catch (err) {
      toast.error(err || "Failed to reject this delivery.");
    } finally {
      setOpenReject(false);
    }
  };

  const handleAdvance = async (status) => {
    try {
      await dispatch(
        updateDeliveryStatusThunk({ orderId: id, status })
      ).unwrap();
      toast.success("Delivery updated.");
      load();
    } catch (err) {
      toast.error(err || "Failed to update this delivery.");
    }
  };

  if (loading && !currentOrder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <Bike size={38} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Delivery not found</h2>
        <p className="text-sm text-gray-500">
          This delivery may have been reassigned to another rider.
        </p>
        <button
          type="button"
          onClick={() => navigate("/rider/deliveries")}
          className="rounded-xl bg-pink-600 px-6 py-2.5 font-bold text-white transition hover:bg-pink-700"
        >
          My Deliveries
        </button>
      </div>
    );
  }

  const {
    orderNumber,
    restaurant,
    user: customer,
    items = [],
    deliveryAddress,
    deliveryLocation,
    phone,
    notes,
    paymentMethod,
    total,
    orderStatus,
    riderStatus,
    statusHistory = [],
    createdAt,
  } = currentOrder;

  const isNew = riderStatus === "assigned";
  const nextStep = riderStatus === "accepted" ? NEXT_STEP[orderStatus] : null;
  const NextIcon = nextStep?.icon;

  // Restaurant coordinates come from GeoJSON: [longitude, latitude].
  const restaurantCoords = restaurant?.location?.coordinates;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-pink-600"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
        <div>
          <p className="font-mono text-xs text-gray-400">{orderNumber}</p>
          <h1 className="mt-1 text-xl font-black text-gray-900">
            {restaurant?.name} → {customer?.name}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            Placed {new Date(createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <OrderStatusBadge status={orderStatus} />
      </div>

      {/* Accept / reject a fresh assignment */}
      {isNew && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold text-amber-900">New delivery request</p>
          <p className="mt-1 text-sm text-amber-800">
            Accept it to start delivering, or reject it so the restaurant can
            assign another rider.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50 sm:flex-none"
            >
              {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Accept Delivery
            </button>

            <button
              type="button"
              onClick={() => setOpenReject(true)}
              disabled={actionLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:flex-none"
            >
              <X size={16} />
              Reject
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Map + stops */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-gray-900">Route</h2>
              {route && (
                <span className="text-xs font-semibold text-gray-600">
                  {formatDistance(route.distance)} • {formatDuration(route.duration)}
                  {route.estimated ? " (estimated)" : ""}
                </span>
              )}
            </div>

            <OrderTrackingMap
              restaurant={tracking?.restaurant}
              delivery={tracking?.delivery}
              rider={riderForMap}
              orderStatus={orderStatus}
              height={360}
              onRouteChange={handleRouteChange}
            />
          </div>

          {/* Stops */}
          <div className="space-y-4">
            {/* Pickup */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Store size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Pickup
                    </p>
                    <p className="font-bold text-gray-900">{restaurant?.name}</p>
                    {restaurant?.address && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {restaurant.address}
                        {restaurant.city ? `, ${restaurant.city}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {restaurant?.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    <Phone size={13} />
                    Call restaurant
                  </a>
                )}

                {restaurantCoords?.length === 2 && (
                  <a
                    href={directionsUrl(restaurantCoords[1], restaurantCoords[0])}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                  >
                    <Navigation size={13} />
                    Directions
                  </a>
                )}
              </div>
            </div>

            {/* Dropoff */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <MapPin size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Drop off
                  </p>
                  <p className="flex items-center gap-1.5 font-bold text-gray-900">
                    <User size={14} className="text-gray-400" />
                    {customer?.name}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">{deliveryAddress}</p>
                  {(deliveryLocation?.city || deliveryLocation?.postalCode) && (
                    <p className="text-xs text-gray-400">
                      {[deliveryLocation.city, deliveryLocation.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {notes && (
                <div className="mt-3 flex gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs">
                  <MessageSquare size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <span>
                    <span className="font-bold text-gray-800">Customer note:</span>{" "}
                    {notes}
                  </span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    <Phone size={13} />
                    Call customer
                  </a>
                )}

                {deliveryLocation?.latitude && deliveryLocation?.longitude && (
                  <a
                    href={directionsUrl(
                      deliveryLocation.latitude,
                      deliveryLocation.longitude
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                  >
                    <Navigation size={13} />
                    Directions
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Items to hand over */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
            <h2 className="mb-3 font-bold text-gray-900">Items</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
            <h2 className="font-bold text-gray-900">Payment</h2>

            {paymentMethod === "cod" ? (
              <div className="mt-3 rounded-xl bg-amber-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                  <Banknote size={13} />
                  Collect on delivery
                </p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  Rs. {total?.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-green-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-green-700">
                  <Banknote size={13} />
                  Already paid online
                </p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  Rs. {total?.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Nothing to collect from the customer.
                </p>
              </div>
            )}
          </div>

          {/* Next step */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
            <h2 className="font-bold text-gray-900">Next Step</h2>

            {nextStep ? (
              <button
                type="button"
                onClick={() => handleAdvance(nextStep.status)}
                disabled={actionLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-pink-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  NextIcon && <NextIcon size={17} />
                )}
                {nextStep.label}
              </button>
            ) : orderStatus === "delivered" ? (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                <CheckCircle2 size={16} />
                Delivered. Nice work!
              </p>
            ) : isNew ? (
              <p className="mt-3 text-sm text-gray-500">
                Accept this delivery to unlock the status updates.
              </p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                {WAITING_MESSAGES[orderStatus] ||
                  "There is nothing to update right now."}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-gray-100 bg-white px-5 pb-2 shadow-xs">
            <OrderTimeline
              statusHistory={statusHistory}
              currentStatus={orderStatus}
            />
          </div>
        </div>
      </div>

      <RejectDeliveryModal
        open={openReject}
        order={currentOrder}
        onClose={() => setOpenReject(false)}
        onConfirm={handleReject}
        loading={actionLoading}
      />
    </div>
  );
};

export default RiderOrderDetails;
