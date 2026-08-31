import express from "express";
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes for appointments
router
    .route("/")
    .post(protect, createAppointment)
    .get(protect, getAppointments);

router
    .route("/:id")
    .get(protect, getAppointmentById)
    .delete(protect, authorize("Admin", "Receptionist"), deleteAppointment);

router
    .route("/:id/status")
    .put(protect, authorize("Doctor", "Receptionist", "Admin"), updateAppointmentStatus);

export default router;
