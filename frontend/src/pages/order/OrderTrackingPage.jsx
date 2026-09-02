import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Route as RouteIcon,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";

import { getOrderTrackingThunk } from "../../redux/order/orderThunk";
import { clearOrderError, clearTracking } from "../../redux/order/orderSlice";
import useOrderSocket from "../../hooks/useOrderSocket";
import OrderTrackingMap from "../../components/map/OrderTrackingMap";
import RiderInfoCard from "../../components/order/RiderInfoCard";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderTimeline from "../../components/order/OrderTimeline";
import {
  formatDistance,
  formatDuration,
  formatEta,
} from "../../services/location.service";

// Short, human explanation of where the order is right now.
const statusMessages = {
  pending: "Waiting for the restaurant to confirm your order.",
  accepted: "The restaurant confirmed your order and will start cooking soon.",
  preparing: "Your food is being prepared.",
  ready: "Your order is packed and waiting for a rider to collect it.",
  picked_up: "Your rider has collected the order and is on the way.",
  out_for_delivery: "Your rider is on the way to you.",
  delivered: "Delivered. Enjoy your meal!",
  cancelled: "This order was cancelled.",
  rejected: "The restaurant could not accept this order.",
};

const LIVE_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "out_for_delivery",
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { tracking, trackingLoading, error } = useSelector(
    (state) => state.order
  );

  const [route, setRoute] = useState(null);

  // Initial load
  useEffect(() => {
    if (id) dispatch(getOrderTrackingThunk(id));

    return () => {
      dispatch(clearTracking());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  // Live updates over Socket.IO
  useOrderSocket(
    id,
    useCallback((event, payload) => {
      if (event === "order:status") {
        toast.success("Order status updated");
      }
      if (event === "order:rider-assigned" && payload?.rider) {
        toast.success(`${payload.rider.name} is handling your delivery`);
      }
    }, [])
  );

  const isLive = tracking && LIVE_STATUSES.includes(tracking.orderStatus);

  // Safety net: if a socket event is missed, refresh while the order is live.
  useEffect(() => {
    if (!id || !isLive) return;

    const interval = setInterval(() => {
      dispatch(getOrderTrackingThunk(id));
    }, 45000);

    return () => clearInterval(interval);
  }, [dispatch, id, isLive]);

  const handleRouteChange = useCallback((next) => setRoute(next), []);

  if (trackingLoading && !tracking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <Navigation size={40} className="text-gray-300" />
        <h2 className="text-2xl font-black text-gray-900">
          Tracking unavailable
        </h2>
        <p className="text-gray-500">
          We couldn't load tracking information for this order.
        </p>
        <Link
          to="/my-orders"
          className="rounded-xl bg-pink-600 px-6 py-3 font-bold text-white transition hover:bg-pink-700"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const showEta = isLive && route;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/orders/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-pink-600"
        >
          <ArrowLeft size={16} />
          Order Details
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Track Your Order
            </h1>
            <p className="mt-1 font-mono text-sm text-gray-500">
              {tracking.orderNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <OrderStatusBadge status={tracking.orderStatus} />
            <button
              type="button"
              onClick={() => dispatch(getOrderTrackingThunk(id))}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-pink-600"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={trackingLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Map + rider */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Live Location</h2>
              {isLive && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                  </span>
                  Live
                </span>
              )}
            </div>

            <OrderTrackingMap
              restaurant={tracking.restaurant}
              delivery={tracking.delivery}
              rider={tracking.rider}
              orderStatus={tracking.orderStatus}
              height={420}
              onRouteChange={handleRouteChange}
            />

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                Restaurant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                Your address
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-600" />
                Rider
              </span>
            </div>
          </div>

          <RiderInfoCard
            rider={tracking.rider}
            riderStatus={tracking.riderStatus}
          />
        </div>

        {/* Status panel */}
        <div className="space-y-6">
          {/* Current status */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
            <h2 className="font-bold text-gray-900">Current Status</h2>
            <p className="mt-2 text-sm text-gray-600">
              {statusMessages[tracking.orderStatus] || "Order in progress."}
            </p>

            {showEta && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-pink-50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-pink-700">
                    <Clock size={12} />
                    Arriving in
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-900">
                    {formatDuration(route.duration)}
                  </p>
                  <p className="text-xs text-gray-500">
                    around {formatEta(route.duration)}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                    <RouteIcon size={12} />
                    Distance
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-900">
                    {formatDistance(route.distance)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tracking.rider &&
                    ["picked_up", "out_for_delivery"].includes(
                      tracking.orderStatus
                    )
                      ? "rider to you"
                      : "restaurant to you"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Restaurant */}
          {tracking.restaurant && (
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
              <h2 className="mb-3 font-bold text-gray-900">Restaurant</h2>

              <div className="flex items-start gap-3">
                {tracking.restaurant.logo ? (
                  <img
                    src={tracking.restaurant.logo}
                    alt={tracking.restaurant.name}
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Store size={18} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {tracking.restaurant.name}
                  </p>
                  {tracking.restaurant.address && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {tracking.restaurant.address}
                    </p>
                  )}
                </div>

                {tracking.restaurant.phone && (
                  <a
                    href={`tel:${tracking.restaurant.phone}`}
                    className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 hover:text-pink-600"
                    title="Call restaurant"
                  >
                    <Phone size={14} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Delivery address */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
            <h2 className="mb-3 font-bold text-gray-900">Delivering To</h2>

            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-pink-600" />
              <div className="min-w-0">
                <p className="text-sm text-gray-800">
                  {tracking.delivery.address}
                </p>
                {(tracking.delivery.city || tracking.delivery.postalCode) && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {[tracking.delivery.city, tracking.delivery.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {tracking.delivery.phone && (
                  <p className="mt-1 text-xs text-gray-500">
                    {tracking.delivery.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-3xl border border-gray-100 bg-white px-6 pb-2 shadow-xs">
            <OrderTimeline
              statusHistory={tracking.statusHistory}
              currentStatus={tracking.orderStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
