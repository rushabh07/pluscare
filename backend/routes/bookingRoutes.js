import express from "express";
import {
    createBooking,
    getUserBookings,
    getProviderBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking,
    resendReceipt,
    getReceipt,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/user", protect, getUserBookings);
router.get("/provider", protect, getProviderBookings);
router.get("/", protect, authorize("Admin"), getAllBookings);
router.put("/:id/status", protect, updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);
router.post("/:id/send-receipt", protect, resendReceipt);
router.get("/:id/receipt", protect, getReceipt);

export default router;
