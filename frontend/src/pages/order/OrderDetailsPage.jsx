import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOrderByIdThunk, cancelOrderThunk } from "../../redux/order/orderThunk";
import { clearOrderSuccess, clearOrderError, clearCurrentOrder } from "../../redux/order/orderSlice";
import OrderTimeline from "../../components/order/OrderTimeline";
import OrderItemRow from "../../components/order/OrderItemRow";
import OrderSummary from "../../components/order/OrderSummary";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import RiderInfoCard from "../../components/order/RiderInfoCard";
import OrderTrackingMap from "../../components/map/OrderTrackingMap";
import useOrderSocket from "../../hooks/useOrderSocket";
import {
  formatDistance,
  formatDuration,
  formatEta,
} from "../../services/location.service";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  X,
  Navigation,
  Route as RouteIcon,
  Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Orders that are still moving can be followed on the live map.
const TRACKABLE_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "out_for_delivery",
];

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder, loading, error, success, statusUpdateLoading } = useSelector(
    (state) => state.order
  );

  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [route, setRoute] = useState(null);

  const handleRouteChange = useCallback((next) => setRoute(next), []);

  // Listen for real-time order status and rider location updates
  useOrderSocket(
    id,
    useCallback((event, payload) => {
      if (event === "order:status") {
        toast.success("Order status updated!");
      }
      if (event === "order:rider-assigned" && payload?.rider) {
        toast.success(`${payload.rider.name} is handling your delivery`);
      }
    }, [])
  );

  // Fetch order details
  useEffect(() => {
    dispatch(getOrderByIdThunk(id));
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  // Handle successes & errors
  useEffect(() => {
    if (success) {
      toast.success("Order status updated!");
      dispatch(clearOrderSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  const handleCancelOrderSubmit = () => {
    if (!cancelReason.trim()) {
      return toast.error("Please provide a reason for cancellation.");
    }
    dispatch(cancelOrderThunk({ orderId: id, reason: cancelReason }));
    setOpenCancelModal(false);
    setCancelReason("");
  };

  if (loading && !currentOrder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          The order you are looking for does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate("/my-orders")}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow"
        >
          My Orders
        </button>
      </div>
    );
  }

  const {
    orderNumber,
    restaurant,
    items = [],
    deliveryAddress,
    deliveryLocation,
    phone,
    notes,
    paymentMethod,
    paymentStatus,
    orderStatus,
    statusHistory = [],
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    createdAt,
    cancelReason: dbCancelReason,
    assignedRider,
    riderStatus,
  } = currentOrder;

  const dateStr = new Date(createdAt).toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPending = orderStatus === "pending";
  const isTrackable = TRACKABLE_STATUSES.includes(orderStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header action */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-600 transition mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Status, items, address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 font-mono block">
                  ORDER ID
                </span>
                <h1 className="text-xl font-black text-gray-900 font-mono">
                  {orderNumber}
                </h1>
              </div>
              <div className="shrink-0">
                <OrderStatusBadge status={orderStatus} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
              <Clock size={14} />
              <span>Placed on {dateStr}</span>
            </div>

            {(orderStatus === "cancelled" || orderStatus === "rejected") && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-800 text-sm">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {orderStatus === "rejected"
                      ? "Order Rejected by Restaurant"
                      : "Order Cancelled"}
                  </span>
                  <p className="mt-0.5 text-xs text-red-700">
                    Reason: {dbCancelReason || "Not provided"}
                  </p>
                </div>
              </div>
            )}

            {/* Live tracking + Cancel actions */}
            {(isTrackable || isPending) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isTrackable && (
                  <Link
                    to={`/orders/${id}/track`}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <Navigation size={16} />
                    Open Full Screen Tracker
                  </Link>
                )}

                {isPending && (
                  <button
                    onClick={() => setOpenCancelModal(true)}
                    disabled={statusUpdateLoading}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-2xl transition text-sm cursor-pointer disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Interactive Live Map Section */}
          {isTrackable && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">Live Delivery Tracking</h2>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                    </span>
                    Live
                  </span>
                </div>

                <Link
                  to={`/orders/${id}/track`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl transition"
                >
                  <Maximize2 size={13} />
                  Full Screen Map
                </Link>
              </div>

              {route && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 bg-pink-50/40 p-3 rounded-2xl border border-pink-100/50">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <Clock size={14} className="text-pink-600" />
                    Arriving in: <strong className="text-pink-700">{formatDuration(route.duration)}</strong> (~{formatEta(route.duration)})
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <RouteIcon size={14} className="text-pink-600" />
                    Distance: <strong className="text-gray-900">{formatDistance(route.distance)}</strong>
                  </span>
                </div>
              )}

              <OrderTrackingMap
                restaurant={restaurant}
                delivery={{
                  address: deliveryAddress,
                  latitude: deliveryLocation?.latitude,
                  longitude: deliveryLocation?.longitude,
                }}
                rider={assignedRider}
                orderStatus={orderStatus}
                height={340}
                onRouteChange={handleRouteChange}
              />

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 pt-1 border-t border-gray-100">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  Restaurant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                  Your address
                </span>
                {assignedRider && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-600" />
                    Rider ({assignedRider.name})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Restaurant details and items */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Items Ordered</h2>
              <span className="text-sm font-bold text-pink-600">
                {restaurant?.name}
              </span>
            </div>

            {/* Items list */}
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Delivery & Payment</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Delivery Details
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span>{deliveryAddress}</span>
                      {(deliveryLocation?.city || deliveryLocation?.postalCode) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[deliveryLocation.city, deliveryLocation.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Phone size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{phone}</span>
                  </div>
                  {notes && (
                    <div className="flex gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100 mt-2 text-xs">
                      <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-gray-800">Note:</span> {notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Payment Details
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Method</span>
                    <span className="font-bold uppercase">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`font-bold capitalize ${paymentStatus === "paid"
                          ? "text-green-600"
                          : paymentStatus === "refunded"
                            ? "text-blue-600"
                            : paymentStatus === "failed"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Status timeline & totals */}
        <div className="space-y-6">
          {/* Rider — only relevant once the order is on its way or was assigned */}
          {(assignedRider || (isTrackable && riderStatus && riderStatus !== "unassigned")) && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Delivery Rider</h2>
              <RiderInfoCard rider={assignedRider} riderStatus={riderStatus} />
            </div>
          )}

          {/* Track timeline card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <OrderTimeline
              statusHistory={statusHistory}
              currentStatus={orderStatus}
            />
          </div>

          {/* Pricing summary */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              tax={tax}
              discount={discount}
              total={total}
            />
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog Modal */}
      <Dialog
        open={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "24px", p: 1 },
        }}
      >
        <DialogTitle className="font-bold text-gray-900 text-lg flex items-center justify-between pb-0">
          Cancel Order
          <button
            onClick={() => setOpenCancelModal(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </DialogTitle>
        <DialogContent className="pt-4 space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Please let us know the reason for cancellation. Refunds for online payments will be processed in 3-5 business days.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Changed my mind, ordered from wrong place, delivery takes too long"
            className="w-full min-h-[90px] bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl p-3 text-sm outline-none resize-none"
            required
          />
        </DialogContent>
        <DialogActions className="p-4 pt-0 gap-2">
          <button
            onClick={() => setOpenCancelModal(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleCancelOrderSubmit}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            Cancel Order
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderDetailsPage;
