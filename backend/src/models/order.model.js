import mongoose from "mongoose";

// ─── Order Item (snapshot at time of order) ──────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
  },
  { _id: false }
);

// ─── Status History Entry ────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// ─── Order Schema ────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must have at least one item.",
      },
    },

    // ── Delivery Info ──────────────────────────────────────────────
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },

    // Structured delivery location captured by the LocationPicker map.
    // Kept separate from `deliveryAddress` so the human-readable string
    // stays intact while GPS tracking gets precise coordinates.
    deliveryLocation: {
      latitude: {
        type: Number,
        default: null,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        default: null,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
      postalCode: {
        type: String,
        default: "",
        trim: true,
      },
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Payment ────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "wallet"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // ── Order Status ───────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },

    statusHistory: [statusHistorySchema],

    // ── Rider Assignment ───────────────────────────────────────────
    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Tracks the rider's own response to the assignment.
    riderStatus: {
      type: String,
      enum: ["unassigned", "assigned", "accepted", "rejected"],
      default: "unassigned",
    },

    riderAssignedAt: {
      type: Date,
      default: null,
    },

    riderRejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Pricing (server-calculated) ────────────────────────────────
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── Cancellation ───────────────────────────────────────────────
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto-generate order number before validation ────────────────────
orderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
});

// ─── Indexes ─────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ assignedRider: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
