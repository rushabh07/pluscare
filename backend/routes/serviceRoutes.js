import express from "express";
import {
    getServices,
    getCategories,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getServices);
router.get("/categories", getCategories);
router.get("/:id", getServiceById);

// Admin only endpoints
router.post("/", protect, authorize("Admin"), createService);
router.put("/:id", protect, authorize("Admin"), updateService);
router.delete("/:id", protect, authorize("Admin"), deleteService);

export default router;
