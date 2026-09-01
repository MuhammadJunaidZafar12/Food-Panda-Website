import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Loader2 } from "lucide-react";

// Common reasons, so a rider on a phone rarely has to type.
const quickReasons = [
  "Too far from my location",
  "Already on another delivery",
  "Vehicle problem",
  "Restaurant is closed",
];

/**
 * RejectDeliveryModal
 * -------------------
 * Asks the rider why they are turning a delivery down. The reason is stored on
 * the order so the restaurant knows what happened before reassigning it.
 */
const RejectDeliveryModal = ({ open, onClose, order, onConfirm, loading }) => {
  // Tied to the order it was typed for, so a different delivery always opens
  // with an empty box without an effect having to clear it.
  const [draft, setDraft] = useState({ orderId: null, reason: "" });
  const reason = draft.orderId === order?._id ? draft.reason : "";

  const setReason = (value) => setDraft({ orderId: order?._id, reason: value });

  const handleConfirm = () => {
    onConfirm(reason.trim() || "Rejected by rider");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px" } }}
    >
      <DialogTitle className="font-bold text-gray-900">
        Reject this delivery?
        {order && (
          <p className="mt-1 font-mono text-xs font-normal text-gray-500">
            {order.orderNumber}
          </p>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <p className="text-sm text-gray-500">
          The restaurant will be able to assign another rider. Let them know why.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickReasons.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setReason(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                reason === option
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add your own reason (optional)"
          className="mt-3 min-h-[80px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-pink-600 focus:ring-1 focus:ring-pink-600"
        />
      </DialogContent>

      <DialogActions className="gap-2 p-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
        >
          Keep it
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Reject Delivery
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectDeliveryModal;
