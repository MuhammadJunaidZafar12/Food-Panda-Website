import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Check,
  Clock,
  MapPin,
  Phone,
  Store,
  X,
} from "lucide-react";

import OrderStatusBadge from "../order/OrderStatusBadge";

/**
 * RiderOrderCard
 * --------------
 * One assigned delivery, as the rider sees it: where to collect, where to drop
 * off, what to collect on delivery, and the action that moves it forward.
 *
 * Purely presentational — the parent supplies the handlers.
 */
const RiderOrderCard = ({ order, onAccept, onReject, actionLoading }) => {
  const {
    _id,
    orderNumber,
    restaurant,
    user: customer,
    deliveryAddress,
    deliveryLocation,
    orderStatus,
    riderStatus,
    paymentMethod,
    total,
    items = [],
    createdAt,
  } = order;

  const isNew = riderStatus === "assigned";
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const timeStr = new Date(createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-xs transition hover:shadow-md sm:p-5 ${
        isNew ? "border-amber-300 ring-1 ring-amber-100" : "border-gray-100"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-gray-400">{orderNumber}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            {timeStr}
            <span className="text-gray-300">•</span>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={orderStatus} />
          {isNew && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
              New assignment
            </span>
          )}
        </div>
      </div>

      {/* Pickup → Dropoff */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Store size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Pick up
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">
              {restaurant?.name || "Restaurant"}
            </p>
            {restaurant?.address && (
              <p className="text-xs text-gray-500">{restaurant.address}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <MapPin size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Deliver to
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {customer?.name || "Customer"}
            </p>
            <p className="text-xs text-gray-500">{deliveryAddress}</p>
            {(deliveryLocation?.city || deliveryLocation?.postalCode) && (
              <p className="text-xs text-gray-400">
                {[deliveryLocation.city, deliveryLocation.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        {paymentMethod === "cod" ? (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <Banknote size={13} />
            Collect Rs. {total?.toLocaleString()}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            <Banknote size={13} />
            Already paid • Rs. {total?.toLocaleString()}
          </span>
        )}

        {customer?.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <Phone size={12} />
            Call customer
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isNew && onAccept && onReject ? (
          <>
            <button
              type="button"
              onClick={() => onAccept(order)}
              disabled={actionLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={16} />
              Accept
            </button>

            <button
              type="button"
              onClick={() => onReject(order)}
              disabled={actionLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <X size={16} />
              Reject
            </button>
          </>
        ) : null}

        <Link
          to={`/rider/deliveries/${_id}`}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            isNew
              ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
              : "flex-1 bg-pink-600 text-white hover:bg-pink-700"
          }`}
        >
          {isNew ? "Details" : "Open Delivery"}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};

export default RiderOrderCard;
