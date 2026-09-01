import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { emitToOrder } from "../socket.js";
import {
  ACTIVE_STATUSES,
  getOrderByIdService,
} from "./order.service.js";

// Statuses an order may be in when a rider is (re)assigned to it.
const ASSIGNABLE_STATUSES = ["accepted", "preparing", "ready"];

// The only transitions a rider is allowed to perform.
const RIDER_TRANSITIONS = {
  ready: ["picked_up"],
  picked_up: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};

// ─── Small helpers ───────────────────────────────────────────────────
const parseCoordinates = ({ latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw { status: 400, message: "Valid latitude and longitude are required." };
  }

  if (lat < -90 || lat > 90) {
    throw { status: 400, message: "Latitude must be between -90 and 90." };
  }

  if (lng < -180 || lng > 180) {
    throw { status: 400, message: "Longitude must be between -180 and 180." };
  }

  return { latitude: lat, longitude: lng };
};

const riderPublicFields =
  "name email phone vehicleType vehicleNumber isAvailable currentLocation";

// ═════════════════════════════════════════════════════════════════════
// GET AVAILABLE RIDERS (Owner / Admin)
// ═════════════════════════════════════════════════════════════════════
export const getAvailableRidersService = async () => {
  const riders = await User.find({
    role: "rider",
    isBlocked: false,
    isAvailable: true,
  })
    .select(riderPublicFields)
    .sort({ name: 1 });

  // Show how busy each available rider currently is so whoever assigns
  // the delivery can pick the least loaded one.
  const loads = await Order.aggregate([
    {
      $match: {
        assignedRider: { $in: riders.map((r) => r._id) },
        orderStatus: { $in: ACTIVE_STATUSES },
      },
    },
    { $group: { _id: "$assignedRider", activeOrders: { $sum: 1 } } },
  ]);

  const loadMap = {};
  loads.forEach((l) => {
    loadMap[l._id.toString()] = l.activeOrders;
  });

  return riders.map((rider) => ({
    ...rider.toObject(),
    activeOrders: loadMap[rider._id.toString()] || 0,
  }));
};

// ═════════════════════════════════════════════════════════════════════
// GET ALL RIDERS (Admin)
// ═════════════════════════════════════════════════════════════════════
export const getAllRidersService = async (query = {}) => {
  const { search, availability } = query;

  const filter = { role: "rider" };

  if (availability === "available") {
    filter.isAvailable = true;
  } else if (availability === "unavailable") {
    filter.isAvailable = false;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const riders = await User.find(filter)
    .select(`${riderPublicFields} isBlocked createdAt`)
    .sort({ createdAt: -1 });

  const riderIds = riders.map((r) => r._id);

  const [activeLoads, deliveredLoads] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          assignedRider: { $in: riderIds },
          orderStatus: { $in: ACTIVE_STATUSES },
        },
      },
      { $group: { _id: "$assignedRider", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          assignedRider: { $in: riderIds },
          orderStatus: "delivered",
        },
      },
      { $group: { _id: "$assignedRider", count: { $sum: 1 } } },
    ]),
  ]);

  const toMap = (rows) => {
    const map = {};
    rows.forEach((r) => {
      map[r._id.toString()] = r.count;
    });
    return map;
  };

  const activeMap = toMap(activeLoads);
  const deliveredMap = toMap(deliveredLoads);

  return riders.map((rider) => ({
    ...rider.toObject(),
    activeOrders: activeMap[rider._id.toString()] || 0,
    totalDeliveries: deliveredMap[rider._id.toString()] || 0,
  }));
};

// ═════════════════════════════════════════════════════════════════════
// ASSIGN / REASSIGN RIDER (Owner / Admin)
// ═════════════════════════════════════════════════════════════════════
export const assignRiderToOrderService = async ({
  orderId,
  riderId,
  actorId,
  actorRole,
}) => {
  if (!riderId) {
    throw { status: 400, message: "Rider is required." };
  }

  const order = await Order.findById(orderId).populate(
    "restaurant",
    "owner name logo"
  );

  if (!order) {
    throw { status: 404, message: "Order not found." };
  }

  // Owners may only assign riders to their own restaurants' orders.
  if (
    actorRole !== "admin" &&
    order.restaurant.owner.toString() !== actorId
  ) {
    throw {
      status: 403,
      message: "You are not authorized to assign a rider to this order.",
    };
  }

  if (!ASSIGNABLE_STATUSES.includes(order.orderStatus)) {
    throw {
      status: 400,
      message: `A rider cannot be assigned while the order is "${order.orderStatus}". Accept the order first.`,
    };
  }

  const rider = await User.findById(riderId);

  if (!rider || rider.role !== "rider") {
    throw { status: 404, message: "Rider not found." };
  }

  if (rider.isBlocked) {
    throw { status: 400, message: "This rider account is blocked." };
  }

  if (
    order.assignedRider &&
    order.assignedRider.toString() === riderId.toString() &&
    order.riderStatus !== "rejected"
  ) {
    throw {
      status: 400,
      message: "This rider is already assigned to this order.",
    };
  }

  order.assignedRider = rider._id;
  order.riderStatus = "assigned";
  order.riderAssignedAt = new Date();
  order.riderRejectionReason = "";

  await order.save();

  await order.populate("assignedRider", riderPublicFields);
  await order.populate("user", "name email phone");

  emitToOrder(order._id.toString(), "order:rider-assigned", {
    orderId: order._id.toString(),
    rider: order.assignedRider,
    riderStatus: order.riderStatus,
  });

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// GET MY ASSIGNED ORDERS (Rider)
// ═════════════════════════════════════════════════════════════════════
export const getRiderOrdersService = async (riderId, query = {}) => {
  const { status = "all", page = 1, limit = 10 } = query;

  const filter = { assignedRider: riderId };

  if (status === "new") {
    // Freshly assigned, waiting for the rider to accept or reject.
    filter.riderStatus = "assigned";
  } else if (status === "active") {
    filter.riderStatus = "accepted";
    filter.orderStatus = { $in: ACTIVE_STATUSES };
  } else if (status === "completed") {
    filter.orderStatus = "delivered";
  } else if (status !== "all") {
    filter.orderStatus = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("restaurant", "name logo phone address city location")
      .populate("user", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

// ═════════════════════════════════════════════════════════════════════
// ACCEPT / REJECT AN ASSIGNMENT (Rider)
// ═════════════════════════════════════════════════════════════════════
export const respondToAssignmentService = async (
  orderId,
  riderId,
  action,
  reason
) => {
  if (!["accept", "reject"].includes(action)) {
    throw { status: 400, message: 'Action must be "accept" or "reject".' };
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw { status: 404, message: "Order not found." };
  }

  if (!order.assignedRider || order.assignedRider.toString() !== riderId) {
    throw { status: 403, message: "This order is not assigned to you." };
  }

  if (order.riderStatus !== "assigned") {
    throw {
      status: 400,
      message: `You have already responded to this assignment (${order.riderStatus}).`,
    };
  }

  if (action === "accept") {
    order.riderStatus = "accepted";
    order.riderRejectionReason = "";
  } else {
    // Release the order so the restaurant or admin can assign someone else,
    // but keep a record of the refusal.
    order.riderStatus = "rejected";
    order.assignedRider = null;
    order.riderRejectionReason = reason || "Rejected by rider";
  }

  await order.save();

  if (order.assignedRider) {
    await order.populate("assignedRider", riderPublicFields);
  }
  await order.populate("restaurant", "name logo phone address city location");
  await order.populate("user", "name phone");

  emitToOrder(order._id.toString(), "order:rider-response", {
    orderId: order._id.toString(),
    riderStatus: order.riderStatus,
    rider: order.assignedRider || null,
  });

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// UPDATE DELIVERY STATUS (Rider)
// ═════════════════════════════════════════════════════════════════════
export const riderUpdateOrderStatusService = async (
  orderId,
  riderId,
  newStatus,
  note
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw { status: 404, message: "Order not found." };
  }

  if (!order.assignedRider || order.assignedRider.toString() !== riderId) {
    throw { status: 403, message: "This order is not assigned to you." };
  }

  if (order.riderStatus !== "accepted") {
    throw {
      status: 400,
      message: "Accept this delivery before updating its status.",
    };
  }

  const allowed = RIDER_TRANSITIONS[order.orderStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    throw {
      status: 400,
      message: `You cannot move this order from "${order.orderStatus}" to "${newStatus}".`,
    };
  }

  order.orderStatus = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Updated to ${newStatus} by rider`,
  });

  // Cash is collected on hand-over.
  if (newStatus === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
  }

  await order.save();

  await order.populate("restaurant", "name logo phone address city location");
  await order.populate("user", "name phone");

  emitToOrder(order._id.toString(), "order:status", {
    orderId: order._id.toString(),
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
  });

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// UPDATE CURRENT GPS LOCATION (Rider)
// ═════════════════════════════════════════════════════════════════════
export const updateRiderLocationService = async (riderId, coordinates) => {
  const { latitude, longitude } = parseCoordinates(coordinates);

  const rider = await User.findById(riderId);

  if (!rider || rider.role !== "rider") {
    throw { status: 404, message: "Rider not found." };
  }

  rider.currentLocation = {
    latitude,
    longitude,
    updatedAt: new Date(),
  };

  await rider.save();

  // Push the new position to everyone tracking this rider's live deliveries.
  const activeOrders = await Order.find({
    assignedRider: rider._id,
    riderStatus: "accepted",
    orderStatus: { $in: ACTIVE_STATUSES },
  }).select("_id");

  activeOrders.forEach((order) => {
    emitToOrder(order._id.toString(), "rider:location", {
      orderId: order._id.toString(),
      riderId: rider._id.toString(),
      latitude,
      longitude,
      updatedAt: rider.currentLocation.updatedAt,
    });
  });

  return {
    currentLocation: rider.currentLocation,
    notifiedOrders: activeOrders.length,
  };
};

// ═════════════════════════════════════════════════════════════════════
// TOGGLE AVAILABILITY (Rider)
// ═════════════════════════════════════════════════════════════════════
export const setRiderAvailabilityService = async (riderId, isAvailable) => {
  const rider = await User.findById(riderId);

  if (!rider || rider.role !== "rider") {
    throw { status: 404, message: "Rider not found." };
  }

  rider.isAvailable = Boolean(isAvailable);
  await rider.save();

  return {
    isAvailable: rider.isAvailable,
  };
};

// ═════════════════════════════════════════════════════════════════════
// RIDER DASHBOARD STATS (Rider)
// ═════════════════════════════════════════════════════════════════════
export const getRiderStatsService = async (riderId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    rider,
    newAssignments,
    activeDeliveries,
    totalDeliveries,
    todayDeliveries,
    rejectedCount,
    earningsResult,
  ] = await Promise.all([
    User.findById(riderId).select("isAvailable currentLocation"),
    Order.countDocuments({ assignedRider: riderId, riderStatus: "assigned" }),
    Order.countDocuments({
      assignedRider: riderId,
      riderStatus: "accepted",
      orderStatus: { $in: ACTIVE_STATUSES },
    }),
    Order.countDocuments({ assignedRider: riderId, orderStatus: "delivered" }),
    Order.countDocuments({
      assignedRider: riderId,
      orderStatus: "delivered",
      updatedAt: { $gte: todayStart },
    }),
    Order.countDocuments({ assignedRider: riderId, riderStatus: "rejected" }),

    // Delivery fees carried by the orders this rider completed.
    Order.aggregate([
      { $match: { assignedRider: riderId, orderStatus: "delivered" } },
      { $group: { _id: null, total: { $sum: "$deliveryFee" } } },
    ]),
  ]);

  return {
    newAssignments,
    activeDeliveries,
    totalDeliveries,
    todayDeliveries,
    rejectedCount,
    totalDeliveryFees: earningsResult[0]?.total || 0,

    // Lets the dashboard restore the online/offline toggle on reload.
    isAvailable: rider?.isAvailable || false,
    currentLocation: rider?.currentLocation || null,
  };
};

// ═════════════════════════════════════════════════════════════════════
// ORDER TRACKING PAYLOAD (Customer / Owner / Rider / Admin)
// ═════════════════════════════════════════════════════════════════════
export const getOrderTrackingService = async (orderId, userId, userRole) => {
  // Reuse the existing access-control rules rather than duplicating them.
  const order = await getOrderByIdService(orderId, userId, userRole);

  const restaurantCoordinates = order.restaurant?.location?.coordinates || [];

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    riderStatus: order.riderStatus,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    riderAssignedAt: order.riderAssignedAt,

    restaurant: order.restaurant
      ? {
          _id: order.restaurant._id,
          name: order.restaurant.name,
          logo: order.restaurant.logo,
          phone: order.restaurant.phone,
          address: order.restaurant.address,
          city: order.restaurant.city,
          // GeoJSON stores [longitude, latitude]
          latitude: restaurantCoordinates[1] ?? null,
          longitude: restaurantCoordinates[0] ?? null,
        }
      : null,

    delivery: {
      address: order.deliveryAddress,
      latitude: order.deliveryLocation?.latitude ?? null,
      longitude: order.deliveryLocation?.longitude ?? null,
      city: order.deliveryLocation?.city || "",
      postalCode: order.deliveryLocation?.postalCode || "",
      phone: order.phone,
    },

    rider: order.assignedRider
      ? {
          _id: order.assignedRider._id,
          name: order.assignedRider.name,
          phone: order.assignedRider.phone,
          vehicleType: order.assignedRider.vehicleType,
          vehicleNumber: order.assignedRider.vehicleNumber,
          latitude: order.assignedRider.currentLocation?.latitude ?? null,
          longitude: order.assignedRider.currentLocation?.longitude ?? null,
          locationUpdatedAt:
            order.assignedRider.currentLocation?.updatedAt ?? null,
        }
      : null,
  };
};
