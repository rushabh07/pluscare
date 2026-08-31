import express from "express";
import {
    createBilling,
    getAllBilling,
    getBillingByPatient,
    getBillingById,
    updatePaymentStatus,
    deleteBilling,
} from "../controllers/billingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all invoices / POST new invoice
router
    .route("/")
    .get(protect, authorize("Admin", "Receptionist"), getAllBilling)
    .post(protect, authorize("Admin", "Receptionist"), createBilling);

// GET invoices for a specific patient
router
    .route("/patient/:patientId")
    .get(protect, getBillingByPatient);

// GET or DELETE a single invoice by ID
router
    .route("/:id")
    .get(protect, getBillingById)
    .delete(protect, authorize("Admin"), deleteBilling);

// Update payment status
router
    .route("/:id/pay")
    .put(protect, authorize("Admin", "Receptionist"), updatePaymentStatus);

export default router;
