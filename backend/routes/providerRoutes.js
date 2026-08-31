import express from "express";
import {
    getProviders,
    getProvidersByCategory,
    getProviderById,
    getProviderAvailability,
    upsertProvider,
} from "../controllers/providerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// IMPORTANT: specific routes must come before /:id to avoid conflicts
router.get("/category/:category", getProvidersByCategory);
router.get("/", getProviders);
router.get("/:id/availability", getProviderAvailability);
router.get("/:id", getProviderById);
router.post("/", protect, authorize("Admin", "Doctor"), upsertProvider);

export default router;
