import { Router } from "express";
import {
  getAvailableRiders,
  getAllRiders,
  getMyDeliveries,
  getMyRiderStats,
  respondToAssignment,
  updateDeliveryStatus,
  updateMyLocation,
  updateMyAvailability,
} from "../controllers/rider.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All rider routes require authentication
router.use(protect);

// ── Rider's own dashboard ────────────────────────────────────────────
router.get("/me/orders", authorize("rider"), getMyDeliveries);
router.get("/me/stats", authorize("rider"), getMyRiderStats);
router.patch("/me/availability", authorize("rider"), updateMyAvailability);
router.patch("/me/location", authorize("rider"), updateMyLocation);

// ── Rider actions on an assigned order ───────────────────────────────
router.patch(
  "/orders/:orderId/respond",
  authorize("rider"),
  respondToAssignment
);
router.patch(
  "/orders/:orderId/status",
  authorize("rider"),
  updateDeliveryStatus
);

// ── Rider directory (used when assigning a delivery) ─────────────────
router.get("/available", authorize("owner", "admin"), getAvailableRiders);
router.get("/", authorize("admin"), getAllRiders);

export default router;
