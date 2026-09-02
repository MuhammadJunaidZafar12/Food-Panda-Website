import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  cancelOrderService,
  getRestaurantOrdersService,
  updateOrderStatusService,
  getAllOrdersService,
  getOrderStatsService,
} from "../services/order.service.js";

import {
  assignRiderToOrderService,
  getOrderTrackingService,
} from "../services/rider.service.js";

// ─── PLACE ORDER (Customer) ─────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, deliveryLocation, phone, notes, paymentMethod } =
      req.body;

    if (!deliveryAddress || !phone) {
      return res.status(400).json({
        success: false,
        message: "Delivery address and phone are required.",
      });
    }

    const order = await createOrderService(req.user._id.toString(), {
      deliveryAddress,
      deliveryLocation,
      phone,
      notes,
      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to place order.",
    });
  }
};

// ─── GET MY ORDERS (Customer) ───────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const result = await getMyOrdersService(
      req.user._id.toString(),
      req.query
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
};

// ─── GET ORDER BY ID ────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await getOrderByIdService(
      req.params.id,
      req.user._id.toString(),
      req.user.role
    );

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch order.",
    });
  }
};

// ─── CANCEL ORDER (Customer) ────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await cancelOrderService(
      req.params.id,
      req.user._id.toString(),
      reason
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to cancel order.",
    });
  }
};

// ─── GET RESTAURANT ORDERS (Owner) ──────────────────────────────────
export const getRestaurantOrders = async (req, res) => {
  try {
    const result = await getRestaurantOrdersService(
      req.user._id.toString(),
      req.params.restaurantId,
      req.query
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get restaurant orders error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch restaurant orders.",
    });
  }
};

// ─── UPDATE ORDER STATUS (Owner / Admin) ────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const order = await updateOrderStatusService(
      req.params.id,
      req.user._id.toString(),
      status,
      note,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update order status.",
    });
  }
};

// ─── GET ALL ORDERS (Admin) ─────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const result = await getAllOrdersService(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
};

// ─── GET ORDER STATS (Owner / Admin) ────────────────────────────────
export const getOrderStats = async (req, res) => {
  try {
    // If owner, pass their ID; if admin, pass null for all orders
    const ownerId =
      req.user.role === "owner" ? req.user._id.toString() : null;

    const stats = await getOrderStatsService(ownerId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch order stats.",
    });
  }
};

// ─── ASSIGN / REASSIGN RIDER (Owner / Admin) ────────────────────────
export const assignRider = async (req, res) => {
  try {
    const { riderId } = req.body;

    const order = await assignRiderToOrderService({
      orderId: req.params.id,
      riderId,
      actorId: req.user._id.toString(),
      actorRole: req.user.role,
    });

    return res.status(200).json({
      success: true,
      message: `Rider assigned to order ${order.orderNumber}.`,
      order,
    });
  } catch (error) {
    console.error("Assign rider error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to assign rider.",
    });
  }
};

// ─── GET LIVE TRACKING DATA (Customer / Owner / Rider / Admin) ──────
export const getOrderTracking = async (req, res) => {
  try {
    const tracking = await getOrderTrackingService(
      req.params.id,
      req.user._id.toString(),
      req.user.role
    );

    return res.status(200).json({
      success: true,
      tracking,
    });
  } catch (error) {
    console.error("Get order tracking error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch order tracking.",
    });
  }
};
