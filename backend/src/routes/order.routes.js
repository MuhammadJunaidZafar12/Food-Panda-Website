import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  assignRider,
  getOrderTracking,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All order routes require authentication
router.use(protect);

// ── Customer Routes ──────────────────────────────────────────────────
router.post("/", authorize("customer", "owner", "admin"), placeOrder);
router.get("/my-orders", authorize("customer", "owner", "admin"), getMyOrders);

// ── Owner Routes ─────────────────────────────────────────────────────
router.get(
  "/restaurant/:restaurantId",
  authorize("owner"),
  getRestaurantOrders
);
router.get("/stats", authorize("owner", "admin"), getOrderStats);

// ── Admin Routes ─────────────────────────────────────────────────────
router.get("/admin", authorize("admin"), getAllOrders);
router.get("/admin/stats", authorize("admin"), getOrderStats);

// ── Shared Routes (order by ID — access checked in service) ─────────
router.get("/:id", getOrderById);

// Live GPS tracking — customer, restaurant owner, assigned rider and admin.
router.get("/:id/tracking", getOrderTracking);

router.patch("/:id/cancel", authorize("customer", "owner", "admin"), cancelOrder);
router.patch("/:id/status", authorize("owner", "admin"), updateOrderStatus);
router.patch("/:id/assign-rider", authorize("owner", "admin"), assignRider);

export default router;
