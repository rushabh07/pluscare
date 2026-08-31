import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    getDoctors,
    getAllUsers,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/doctors", getDoctors);

// Protected user route
router.get("/profile", protect, getUserProfile);

// Admin protected route
router.get("/", protect, authorize("Admin"), getAllUsers);

export default router;
