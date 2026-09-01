import {
  Clock,
  CheckCircle,
  Activity,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  Bike,
  Ban,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "warning",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  accepted: {
    label: "Confirmed",
    color: "info",
    icon: CheckCircle,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  preparing: {
    label: "Preparing",
    color: "secondary",
    icon: Activity,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ready: {
    label: "Ready for Pickup",
    color: "primary",
    icon: Package,
    className: "bg-pink-50 text-pink-700 border-pink-200",
  },
  picked_up: {
    label: "Picked Up",
    color: "info",
    icon: Bike,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "warning",
    icon: Truck,
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  delivered: {
    label: "Delivered",
    color: "success",
    icon: CheckCheck,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "error",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  rejected: {
    label: "Rejected",
    color: "error",
    icon: Ban,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    color: "default",
    icon: Clock,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.className}`}
    >
      <IconComponent size={14} className="shrink-0" />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
