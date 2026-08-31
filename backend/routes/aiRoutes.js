import express from "express";
import {
    handleAIChat,
    handleAITriage,
    handleSmartBooking,
    handleNvidiaChat,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Interact with PlusCare AI Assistant
// @access  Private (JWT Protected)
router.post("/chat", protect, handleAIChat);

// @route   POST /api/ai/triage
// @desc    Analyze symptoms and match with MongoDB doctor & department
// @access  Private (JWT Protected)
router.post("/triage", protect, handleAITriage);

// @route   POST /api/ai/nvidia
// @desc    Interact with Nvidia AI model
// @access  Private (JWT Protected)
router.post("/nvidia", protect, handleNvidiaChat);

export default router;
