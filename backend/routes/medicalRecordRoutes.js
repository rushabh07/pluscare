import express from "express";
import {
    getAssignedPatients,
    createMedicalRecord,
    getDoctorMedicalRecords,
    getPatientMedicalRecords,
    getMedicalRecordById,
    updateMedicalRecord,
} from "../controllers/medicalRecordController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply JWT Protect and Doctor Authorization to all routes
router.use(protect, authorize("Doctor"));

// Patient list assigned to doctor
router.get("/patients", getAssignedPatients);

// Doctor medical records (Get all or create)
router
    .route("/")
    .get(getDoctorMedicalRecords)
    .post(createMedicalRecord);

// Get medical records for a specific assigned patient
router.get("/patient/:patientId", getPatientMedicalRecords);

// Single medical record by ID (Get or Update)
router
    .route("/:id")
    .get(getMedicalRecordById)
    .put(updateMedicalRecord);

export default router;
