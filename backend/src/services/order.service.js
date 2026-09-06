import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Restaurant from "../models/restaurant.model.js";
import { emitToOrder } from "../socket.js";

// ─── Tax rate (flat 5%) ──────────────────────────────────────────────
const TAX_RATE = 0.05;

// ─── Valid status transitions ────────────────────────────────────────
// "picked_up" is set by the assigned rider once they collect the food.
// A restaurant can still move "ready" straight to "out_for_delivery"
// when it delivers without a platform rider.
const VALID_TRANSITIONS = {
  pending: ["accepted", "cancelled", "rejected"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["picked_up", "out_for_delivery"],
  picked_up: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};

// Statuses that count as "in progress" for filters and stats.
export const ACTIVE_STATUSES = [
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "out_for_delivery",
];

/**
 * Validate and normalise the coordinates coming from the LocationPicker.
 * Coordinates are optional so older clients keep working, but when they are
 * supplied they must be real numbers inside valid GPS ranges — live tracking
 * depends on them.
 */
const normaliseDeliveryLocation = (deliveryLocation) => {
  if (!deliveryLocation || typeof deliveryLocation !== "object") {
    return { latitude: null, longitude: null, city: "", postalCode: "" };
  }

  const latitude = Number(deliveryLocation.latitude);
  const longitude = Number(deliveryLocation.longitude);

  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  if (hasCoordinates && (latitude < -90 || latitude > 90)) {
    throw { status: 400, message: "Delivery latitude is out of range." };
  }

  if (hasCoordinates && (longitude < -180 || longitude > 180)) {
    throw { status: 400, message: "Delivery longitude is out of range." };
  }

  return {
    latitude: hasCoordinates ? latitude : null,
    longitude: hasCoordinates ? longitude : null,
    city: (deliveryLocation.city || "").trim(),
    postalCode: (deliveryLocation.postalCode || "").trim(),
  };
};

// ═════════════════════════════════════════════════════════════════════
// CREATE ORDER
// ═════════════════════════════════════════════════════════════════════
export const createOrderService = async (userId, orderData) => {
  const { deliveryAddress, deliveryLocation, phone, notes, paymentMethod } =
    orderData;

  // 1. Fetch cart with items
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw { status: 400, message: "Your cart is empty." };
  }

  // 2. Validate restaurant
  const restaurant = await Restaurant.findById(cart.restaurant);

  if (!restaurant) {
    throw { status: 404, message: "Restaurant not found." };
  }

  if (restaurant.status !== "approved" || !restaurant.isActive) {
    throw {
      status: 400,
      message: "This restaurant is currently not available for orders.",
    };
  }

  // 3. Validate all products and snapshot data from DB
  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  const orderItems = [];

  for (const cartItem of cart.items) {
    const product = productMap[cartItem.product.toString()];

    if (!product) {
      throw {
        status: 400,
        message: `Product "${cartItem.product}" is no longer available.`,
      };
    }

    if (!product.isAvailable) {
      throw {
        status: 400,
        message: `"${product.name}" is currently unavailable.`,
      };
    }

    // Verify product belongs to this restaurant
    if (product.restaurant.toString() !== cart.restaurant.toString()) {
      throw {
        status: 400,
        message: `"${product.name}" does not belong to this restaurant.`,
      };
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image || "",
      price: product.price,
      quantity: cartItem.quantity,
      subtotal: product.price * cartItem.quantity,
    });
  }

  // 4. Calculate pricing server-side
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = restaurant.deliveryFee || 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const discount = 0; // placeholder for future coupon system
  const total = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;

  // 5. Check minimum order
  if (restaurant.minimumOrder > 0 && subtotal < restaurant.minimumOrder) {
    throw {
      status: 400,
      message: `Minimum order amount is Rs. ${restaurant.minimumOrder}. Your subtotal is Rs. ${subtotal}.`,
    };
  }

  // 6. Create order
  const normalisedLocation = normaliseDeliveryLocation(deliveryLocation);

  const order = await Order.create({
    user: userId,
    restaurant: cart.restaurant,
    items: orderItems,
    deliveryAddress,
    deliveryLocation: {
      latitude: normalisedLocation.latitude,
      longitude: normalisedLocation.longitude,
      city: normalisedLocation.city || restaurant.city || "",
      postalCode: normalisedLocation.postalCode || "",
    },
    phone,
    notes: notes || "",
    paymentMethod: paymentMethod || "cod",
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    orderStatus: "pending",
    statusHistory: [
      {
        status: "pending",
        timestamp: new Date(),
        note: "Order placed",
      },
    ],
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
  });

  // 7. Clear cart after successful order creation
  cart.items = [];
  cart.restaurant = null;
  cart.totalAmount = 0;
  await cart.save();

  // 8. Populate and return
  await order.populate("restaurant", "name logo phone address");
  await order.populate("user", "name email phone");

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// GET MY ORDERS (Customer)
// ═════════════════════════════════════════════════════════════════════
export const getMyOrdersService = async (userId, query = {}) => {
  const { status, page = 1, limit = 10 } = query;

  const filter = { user: userId };

  if (status && status !== "all") {
    if (status === "active") {
      filter.orderStatus = {
        $in: ["pending", ...ACTIVE_STATUSES],
      };
    } else if (status === "completed") {
      filter.orderStatus = "delivered";
    } else if (status === "cancelled") {
      filter.orderStatus = { $in: ["cancelled", "rejected"] };
    } else {
      filter.orderStatus = status;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("restaurant", "name logo")
      .populate("assignedRider", "name phone vehicleType vehicleNumber")
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
// GET ORDER BY ID
// ═════════════════════════════════════════════════════════════════════
export const getOrderByIdService = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate(
      "restaurant",
      "name logo phone address city location owner deliveryFee"
    )
    .populate("user", "name email phone")
    .populate("cancelledBy", "name email")
    .populate(
      "assignedRider",
      "name phone email vehicleType vehicleNumber currentLocation isAvailable"
    );

  if (!order) {
    throw { status: 404, message: "Order not found." };
  }

  // Access control
  if (userRole === "customer" && order.user._id.toString() !== userId) {
    throw { status: 403, message: "You are not authorized to view this order." };
  }

  if (
    userRole === "owner" &&
    order.restaurant.owner.toString() !== userId
  ) {
    throw { status: 403, message: "You are not authorized to view this order." };
  }

  // A rider may only open orders currently assigned to them.
  if (
    userRole === "rider" &&
    order.assignedRider?._id?.toString() !== userId
  ) {
    throw { status: 403, message: "This order is not assigned to you." };
  }

  // admin can view any order

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// CANCEL ORDER (Customer)
// ═════════════════════════════════════════════════════════════════════
export const cancelOrderService = async (orderId, userId, cancelReason) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw { status: 404, message: "Order not found." };
  }

  if (order.user.toString() !== userId) {
    throw { status: 403, message: "You are not authorized to cancel this order." };
  }

  if (!["pending"].includes(order.orderStatus)) {
    throw {
      status: 400,
      message: `Cannot cancel order with status "${order.orderStatus}". Only pending orders can be cancelled.`,
    };
  }

  order.orderStatus = "cancelled";
  order.cancelledBy = userId;
  order.cancelReason = cancelReason || "Cancelled by customer";
  order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : "failed";
  order.statusHistory.push({
    status: "cancelled",
    timestamp: new Date(),
    note: cancelReason || "Cancelled by customer",
  });

  await order.save();
  await order.populate("restaurant", "name logo");

  emitToOrder(order._id.toString(), "order:status", {
    orderId: order._id.toString(),
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
  });

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// GET RESTAURANT ORDERS (Owner)
// ═════════════════════════════════════════════════════════════════════
export const getRestaurantOrdersService = async (
  ownerId,
  restaurantId,
  query = {}
) => {
  const { status, page = 1, limit = 10 } = query;

  // Validate restaurant ownership
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw { status: 404, message: "Restaurant not found." };
  }

  if (restaurant.owner.toString() !== ownerId) {
    throw {
      status: 403,
      message: "You are not the owner of this restaurant.",
    };
  }

  const filter = { restaurant: restaurantId };

  if (status && status !== "all") {
    filter.orderStatus = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .populate("restaurant", "name logo")
      .populate(
        "assignedRider",
        "name phone vehicleType vehicleNumber isAvailable"
      )
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
// UPDATE ORDER STATUS (Owner)
// ═════════════════════════════════════════════════════════════════════
export const updateOrderStatusService = async (
  orderId,
  ownerId,
  newStatus,
  note,
  actorRole = "owner"
) => {
  const order = await Order.findById(orderId).populate(
    "restaurant",
    "owner name logo"
  );

  if (!order) {
    throw { status: 404, message: "Order not found." };
  }

  // Verify ownership (an admin may act on any restaurant's order)
  if (
    actorRole !== "admin" &&
    order.restaurant.owner.toString() !== ownerId
  ) {
    throw {
      status: 403,
      message: "You are not authorized to update this order.",
    };
  }

  // Validate transition
  const allowed = VALID_TRANSITIONS[order.orderStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    throw {
      status: 400,
      message: `Cannot transition from "${order.orderStatus}" to "${newStatus}".`,
    };
  }

  order.orderStatus = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status updated to ${newStatus}`,
  });

  // Auto-update payment status for COD on delivery
  if (newStatus === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
  }

  // Handle cancellation or rejection by the restaurant / admin
  if (newStatus === "cancelled" || newStatus === "rejected") {
    order.cancelledBy = ownerId;
    order.cancelReason =
      note ||
      (newStatus === "rejected"
        ? "Rejected by restaurant"
        : "Cancelled by restaurant");

    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    } else {
      order.paymentStatus = "failed";
    }

    // Release the rider so they become free for other deliveries.
    order.assignedRider = null;
    order.riderStatus = "unassigned";
  }

  await order.save();
  await order.populate("user", "name email phone");
  await order.populate(
    "assignedRider",
    "name phone vehicleType vehicleNumber currentLocation"
  );

  emitToOrder(order._id.toString(), "order:status", {
    orderId: order._id.toString(),
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
  });

  return order;
};

// ═════════════════════════════════════════════════════════════════════
// GET ALL ORDERS (Admin)
// ═════════════════════════════════════════════════════════════════════
export const getAllOrdersService = async (query = {}) => {
  const { status, search, assignment, page = 1, limit = 10 } = query;

  const filter = {};

  if (status && status !== "all") {
    if (status === "cancelled") {
      filter.orderStatus = { $in: ["cancelled", "rejected"] };
    } else {
      filter.orderStatus = status;
    }
  }

  // Let admins isolate orders that still need a rider.
  if (assignment === "unassigned") {
    filter.assignedRider = null;
  } else if (assignment === "assigned") {
    filter.assignedRider = { $ne: null };
  }

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .populate("restaurant", "name logo owner")
      .populate(
        "assignedRider",
        "name phone vehicleType vehicleNumber isAvailable currentLocation"
      )
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
// GET ORDER STATS
// ═════════════════════════════════════════════════════════════════════
export const getOrderStatsService = async (ownerId = null) => {
  const matchStage = {};

  // If owner, get their restaurants first
  if (ownerId) {
    const restaurants = await Restaurant.find({ owner: ownerId }).select("_id");
    const restaurantIds = restaurants.map((r) => r._id);
    matchStage.restaurant = { $in: restaurantIds };
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    pendingOrders,
    activeOrders,
    deliveredOrders,
    cancelledOrders,
    revenueResult,
    todayRevenueResult,
    dailyOrders,
  ] = await Promise.all([
    Order.countDocuments(matchStage),
    Order.countDocuments({ ...matchStage, orderStatus: "pending" }),
    Order.countDocuments({
      ...matchStage,
      orderStatus: {
        $in: ACTIVE_STATUSES,
      },
    }),
    Order.countDocuments({ ...matchStage, orderStatus: "delivered" }),
    Order.countDocuments({
      ...matchStage,
      orderStatus: { $in: ["cancelled", "rejected"] },
    }),

    // Total revenue (delivered orders)
    Order.aggregate([
      {
        $match: {
          ...matchStage,
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
        },
      },
    ]),

    // Today's revenue
    Order.aggregate([
      {
        $match: {
          ...matchStage,
          orderStatus: "delivered",
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$total" },
        },
      },
    ]),

    // Daily orders (last 7 days)
    Order.aggregate([
      {
        $match: {
          ...matchStage,
          createdAt: { $gte: sevenDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalOrders,
    pendingOrders,
    activeOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    todayRevenue: todayRevenueResult[0]?.todayRevenue || 0,
    dailyOrders,
  };
};
