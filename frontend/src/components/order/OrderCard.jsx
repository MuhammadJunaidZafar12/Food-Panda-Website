import { Link } from "react-router-dom";
import OrderStatusBadge from "./OrderStatusBadge";
import { Calendar, ShoppingBag, ArrowRight } from "lucide-react";

const OrderCard = ({ order }) => {
  const {
    _id,
    orderNumber,
    restaurant,
    items = [],
    total,
    orderStatus,
    createdAt,
  } = order;

  const dateStr = new Date(createdAt).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 p-5 flex flex-col md:flex-row justify-between gap-4">
      <div className="space-y-3 flex-1">
        {/* Header: Restaurant logo and title */}
        <div className="flex items-center gap-3">
          {restaurant?.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center font-bold shrink-0">
              {restaurant?.name?.charAt(0) || "🍴"}
            </div>
          )}
          <div>
            <h4 className="font-bold text-gray-900 leading-snug hover:text-pink-600 transition">
              <Link to={`/orders/${_id}`}>{restaurant?.name || "Restaurant"}</Link>
            </h4>
            <span className="text-xs text-gray-400 font-mono block mt-0.5">
              {orderNumber}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingBag size={14} className="text-gray-400" />
            <span>
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Order Items Preview */}
        <p className="text-xs text-gray-500 truncate max-w-lg">
          {items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
        </p>
      </div>

      {/* Right Column: Status and Link */}
      <div className="flex md:flex-col items-between md:items-end justify-between shrink-0 gap-3 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
        <div className="space-y-1.5 md:text-right">
          <OrderStatusBadge status={orderStatus} />
          <div className="text-base font-extrabold text-gray-900 block mt-1">
            Rs. {total.toLocaleString()}
          </div>
        </div>

        <Link
          to={`/orders/${_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 transition"
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
