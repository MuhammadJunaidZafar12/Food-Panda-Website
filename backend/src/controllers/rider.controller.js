import {
  getAvailableRidersService,
  getAllRidersService,
  getRiderOrdersService,
  respondToAssignmentService,
  riderUpdateOrderStatusService,
  updateRiderLocationService,
  setRiderAvailabilityService,
  getRiderStatsService,
} from "../services/rider.service.js";

// ─── GET AVAILABLE RIDERS (Owner / Admin) ───────────────────────────
export const getAvailableRiders = async (req, res) => {
  try {
    const riders = await getAvailableRidersService();

    return res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    console.error("Get available riders error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch available riders.",
    });
  }
};

// ─── GET ALL RIDERS (Admin) ─────────────────────────────────────────
export const getAllRiders = async (req, res) => {
  try {
    const riders = await getAllRidersService(req.query);

    return res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    console.error("Get all riders error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch riders.",
    });
  }
};

// ─── GET MY ASSIGNED ORDERS (Rider) ─────────────────────────────────
export const getMyDeliveries = async (req, res) => {
  try {
    const result = await getRiderOrdersService(
      req.user._id.toString(),
      req.query
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get rider orders error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch your deliveries.",
    });
  }
};

// ─── GET MY STATS (Rider) ───────────────────────────────────────────
export const getMyRiderStats = async (req, res) => {
  try {
    const stats = await getRiderStatsService(req.user._id.toString());

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get rider stats error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch your stats.",
    });
  }
};

// ─── ACCEPT / REJECT AN ASSIGNMENT (Rider) ──────────────────────────
export const respondToAssignment = async (req, res) => {
  try {
    const { action, reason } = req.body;

    const order = await respondToAssignmentService(
      req.params.orderId,
      req.user._id.toString(),
      action,
      reason
    );

    return res.status(200).json({
      success: true,
      message:
        action === "accept"
          ? "Delivery accepted."
          : "Delivery rejected. The restaurant can assign another rider.",
      order,
    });
  } catch (error) {
    console.error("Respond to assignment error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to respond to this assignment.",
    });
  }
};

// ─── UPDATE DELIVERY STATUS (Rider) ─────────────────────────────────
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const order = await riderUpdateOrderStatusService(
      req.params.orderId,
      req.user._id.toString(),
      status,
      note
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      order,
    });
  } catch (error) {
    console.error("Rider update status error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update delivery status.",
    });
  }
};

// ─── UPDATE MY GPS LOCATION (Rider) ─────────────────────────────────
export const updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const result = await updateRiderLocationService(req.user._id.toString(), {
      latitude,
      longitude,
    });

    return res.status(200).json({
      success: true,
      message: "Location updated.",
      ...result,
    });
  } catch (error) {
    console.error("Update rider location error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update location.",
    });
  }
};

// ─── TOGGLE AVAILABILITY (Rider) ────────────────────────────────────
export const updateMyAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false.",
      });
    }

    const result = await setRiderAvailabilityService(
      req.user._id.toString(),
      isAvailable
    );

    return res.status(200).json({
      success: true,
      message: result.isAvailable
        ? "You are now online and can receive deliveries."
        : "You are now offline.",
      ...result,
    });
  } catch (error) {
    console.error("Update rider availability error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update availability.",
    });
  }
};
