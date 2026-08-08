import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  getAllApprovedRestaurants,
  getAllRejectedRestaurants,
  getAdminDashboardStats,
} from "../controllers/restaurant.controller.js";
import { protect, authorizeOwner, authorize } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { Router } from "express";

const router = Router();
// Admin Routes
// Get pending restaurants
router.get(
  "/pending",
  protect,
  authorize("admin"),
  getPendingRestaurants
);
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveRestaurant
);
router.get(
  "/admin/dashboard/stats",
  protect,
  authorize("admin"),
  getAdminDashboardStats
);
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectRestaurant
);

//Admin Route to get all approved restaurants
router.get(
  "/approved",
  protect,
  authorize("admin"),
  getAllApprovedRestaurants
);

//Admin Route to get all rejected restaurants
router.get(
  "/rejected",
  protect,
  authorize("admin"),
  getAllRejectedRestaurants
);

router.get("/", getRestaurants);
router.get("/my-restaurants", protect, authorizeOwner, getMyRestaurants);

router.get("/:id", protect, getRestaurantById);
router.post(
  "/",
  protect,
  authorizeOwner,
  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "banner",
      maxCount: 1,
    },
  ]),
  createRestaurant
);
router.put(
  "/:id",
  protect,
  authorizeOwner,
  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "banner",
      maxCount: 1,
    },
  ]),
  updateRestaurant
);
router.delete("/:id", protect, authorizeOwner, deleteRestaurant);


export default router;