import express from "express";

import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
} from "../controllers/restaurant.controller.js";
import { protect, authorizeOwner } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { Router } from "express";

const router = Router();

router.get("/", getRestaurants);
router.get("/my-restaurants", protect, authorizeOwner, getMyRestaurants);

router.get("/:id",protect, authorizeOwner, getRestaurantById);
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