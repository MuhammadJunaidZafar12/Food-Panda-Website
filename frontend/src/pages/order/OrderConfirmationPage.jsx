import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Receipt,
  ShoppingBag,
} from "lucide-react";

import { getOrderByIdThunk } from "../../redux/order/orderThunk";
import { clearOrderError } from "../../redux/order/orderSlice";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderSummary from "../../components/order/OrderSummary";
import toast from "react-hot-toast";

/**
 * Shown immediately after an order is placed: a clear confirmation, the key
 * details, and the two things the customer wants next — track it, or keep
 * shopping.
 */
const OrderConfirmationPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (id) dispatch(getOrderByIdThunk(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  if (loading && !currentOrder) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <Receipt size={40} className="text-gray-300" />
        <h2 className="text-2xl font-black text-gray-900">Order not found</h2>
        <Link
          to="/my-orders"
          className="rounded-xl bg-pink-600 px-6 py-3 font-bold text-white transition hover:bg-pink-700"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const order = currentOrder;
  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const placedAt = new Date(order.createdAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={44} />
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-900">
          Order Confirmed!
        </h1>
        <p className="mx-auto mt-2 max-w-md text-gray-500">
          Thanks{order.user?.name ? `, ${order.user.name}` : ""}! We've sent your
          order to {order.restaurant?.name}. You'll be able to follow it live as
          soon as it's on the move.
        </p>

        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-xs">
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Order Number
            </p>
            <p className="font-mono text-sm font-bold text-gray-900">
              {order.orderNumber}
            </p>
          </div>
          <span className="hidden h-8 w-px bg-gray-200 sm:block" />
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Details */}
      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900">Delivery Details</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-pink-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  {order.deliveryAddress}
                </p>
                {(order.deliveryLocation?.city ||
                  order.deliveryLocation?.postalCode) && (
                  <p className="text-xs text-gray-500">
                    {[
                      order.deliveryLocation.city,
                      order.deliveryLocation.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={16} className="shrink-0 text-pink-600" />
              <p className="text-gray-700">{order.phone}</p>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={16} className="shrink-0 text-pink-600" />
              <p className="text-gray-700">Placed on {placedAt}</p>
            </div>

            <div className="flex items-center gap-3">
              <ShoppingBag size={16} className="shrink-0 text-pink-600" />
              <p className="text-gray-700">
                {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
                {order.restaurant?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Payment summary */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Payment</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600">
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : order.paymentMethod === "card"
                ? "Card"
                : "Wallet"}
            </span>
          </div>

          <OrderSummary
            subtotal={order.subtotal}
            deliveryFee={order.deliveryFee}
            tax={order.tax}
            discount={order.discount}
            total={order.total}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          to={`/orders/${order._id}/track`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-pink-700"
        >
          <Navigation size={18} />
          Track Order
        </Link>

        <Link
          to={`/orders/${order._id}`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-bold text-gray-700 transition hover:bg-gray-50"
        >
          <Receipt size={18} />
          Order Details
        </Link>

        <button
          type="button"
          onClick={() => navigate("/restaurants")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Keep Shopping
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
