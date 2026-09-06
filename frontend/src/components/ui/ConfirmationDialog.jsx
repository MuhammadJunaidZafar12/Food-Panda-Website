import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { AlertTriangle, Check, X } from "lucide-react";

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const isBusy = loading || submitting;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return <Dialog
    open={open}
    onClose={isBusy ? undefined : onClose}
    fullWidth
    maxWidth="xs"
    PaperProps={{
      sx: {
        borderRadius: 3,
        overflow: "hidden",
      },
    }}
  >
    <DialogTitle sx={{ pb: 1.5 }}>
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            destructive
              ? "bg-red-100 text-red-600"
              : "bg-pink-100 text-pink-600"
          }`}
        >
          {destructive ? <AlertTriangle size={20} /> : <Check size={20} />}
        </span>
        <span className="pt-1 text-xl font-bold text-gray-900">{title}</span>
      </div>
    </DialogTitle>

    <DialogContent sx={{ pt: "0 !important" }}>
      <p className="pl-[52px] text-sm leading-6 text-gray-600">{description}</p>
    </DialogContent>

    <DialogActions sx={{ gap: 1, px: 3, pb: 3, pt: 1 }}>
      <button
        type="button"
        onClick={onClose}
        disabled={isBusy}
        className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X size={16} />
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isBusy}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
          destructive
            ? "bg-red-600 hover:bg-red-700"
            : "bg-pink-600 hover:bg-pink-700"
        }`}
      >
        {isBusy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <Check size={16} />
        )}
        {confirmLabel}
      </button>
    </DialogActions>
  </Dialog>;
};

export default ConfirmationDialog;