import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getDoctors,
    getAllUsers,
    sendForgotPasswordOtpController,
    resetPasswordWithOtpController,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/doctors", getDoctors);

// Forgot Password OTP routes
router.post("/forgot-password/send-otp", sendForgotPasswordOtpController);
router.post("/forgot-password/verify-otp", resetPasswordWithOtpController);

// Protected user routes
router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin protected route
router.get("/", protect, authorize("Admin"), getAllUsers);

export default router;
