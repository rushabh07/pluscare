import express from "express";
import { getServiceStats } from "../controllers/adminStatsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/services", protect, authorize("Admin"), getServiceStats);

export default router;
