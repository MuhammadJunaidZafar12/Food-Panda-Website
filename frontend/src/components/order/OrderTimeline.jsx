import { Check } from "lucide-react";

const getStatusLabel = (status) => {
  const labels = {
    pending: "Order Placed",
    accepted: "Order Confirmed",
    preparing: "Preparing Food",
    ready: "Ready for Pickup",
    picked_up: "Picked Up by Rider",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rejected: "Rejected by Restaurant",
  };
  return labels[status] || status;
};

// Cancelled and rejected are both dead ends, so they share the red styling.
const isTerminalStatus = (status) =>
  status === "cancelled" || status === "rejected";

const getStatusColor = (status, index, currentStatusIndex) => {
  if (isTerminalStatus(status)) return "bg-red-500 text-white";
  if (index <= currentStatusIndex) return "bg-pink-600 text-white border-pink-600";
  return "bg-gray-100 text-gray-400 border-gray-200";
};

const OrderTimeline = ({ statusHistory = [], currentStatus }) => {
  const allStatuses = [
    "pending",
    "accepted",
    "preparing",
    "ready",
    "picked_up",
    "out_for_delivery",
    "delivered",
  ];

  // "Picked Up" only applies when a platform rider collected the order.
  // Restaurants that deliver themselves go straight from ready to
  // out_for_delivery, so the step is dropped once it can no longer happen.
  const hasPickup = statusHistory.some((h) => h.status === "picked_up");
  const pastPickup = ["out_for_delivery", "delivered"].includes(currentStatus);

  let steps = allStatuses.filter(
    (step) => step !== "picked_up" || hasPickup || !pastPickup
  );

  // A cancelled or rejected order stops where it stopped, so keep only the
  // steps it actually reached and close the timeline with the final status.
  if (isTerminalStatus(currentStatus)) {
    steps = steps.filter((step) =>
      statusHistory.some((h) => h.status === step)
    );
    steps.push(currentStatus);
  }

  const currentStatusIndex = steps.indexOf(currentStatus);

  return (
    <div className="py-4">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Track Order</h3>
      <div className="relative border-l-2 border-gray-200 ml-3.5 space-y-8">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const historyItem = statusHistory.find((h) => h.status === step);
          const time = historyItem ? new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
          const date = historyItem ? new Date(historyItem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : null;
          const note = historyItem?.note;

          return (
            <div key={step} className="relative pl-8">
              {/* Dot icon */}
              <div
                className={`absolute -left-[15px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 ${getStatusColor(
                  step,
                  index,
                  currentStatusIndex
                )}`}
              >
                {isTerminalStatus(step) ? (
                  <span className="font-bold">✕</span>
                ) : isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                )}
              </div>

              {/* Step info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4
                    className={`font-semibold text-sm ${
                      isCurrent
                        ? "text-pink-600"
                        : isCompleted
                        ? "text-gray-950"
                        : "text-gray-400"
                    }`}
                  >
                    {getStatusLabel(step)}
                  </h4>
                  {note && isCompleted && (
                    <p className="text-xs text-gray-500 mt-0.5">{note}</p>
                  )}
                </div>
                {time && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-gray-900 block">{time}</span>
                    <span className="text-[10px] text-gray-400 block">{date}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
