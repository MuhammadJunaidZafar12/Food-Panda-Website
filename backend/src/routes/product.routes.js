import { Router } from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import {
  protect,
  authorizeOwner,
} from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";

const router = Router();


// ==========================================
// Get All Products
// Public
// Optional: ?restaurant=restaurantId
// ==========================================

router.get(
  "/",
  getAllProducts
);


// ==========================================
// Get Product By ID
// Public
// ==========================================

router.get(
  "/:id",
  getProductById
);


// ==========================================
// Create Product
// Owner Only
// ==========================================

router.post(
  "/",
  protect,
  authorizeOwner,
  upload.single("image"),
  createProduct
);


// ==========================================
// Update Product
// Owner Only
// ==========================================

router.put(
  "/:id",
  protect,
  authorizeOwner,
  upload.single("image"),
  updateProduct
);


// ==========================================
// Delete Product
// Owner Only
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeOwner,
  deleteProduct
);


export default router;