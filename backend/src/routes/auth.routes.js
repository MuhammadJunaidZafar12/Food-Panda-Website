import express from "express";
import { register, login, getMe, becomeOwner, getAllUsers, updateUserRole, deleteUser } from "../controllers/auth.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/become-owner", protect, becomeOwner);

// Admin user management routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.patch("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

export default router;