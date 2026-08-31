import mongoose from "mongoose";
import MedicalRecord from "../models/medicalRecordModel.js";
import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";

/**
 * Helper to verify if a patient is assigned to the logged-in doctor.
 * A patient is assigned if there is an appointment with the doctor or an existing medical record.
 */
const isPatientAssignedToDoctor = async (doctorId, patientId) => {
    const appointmentCount = await Appointment.countDocuments({
        doctor: doctorId,
        patient: patientId,
    });
    if (appointmentCount > 0) return true;

    const recordCount = await MedicalRecord.countDocuments({
        doctor: doctorId,
        patient: patientId,
    });
    return recordCount > 0;
};

/**
 * @desc    Get all unique patients assigned to logged-in doctor
 * @route   GET /api/medical-records/patients
 * @access  Private (Doctor)
 */
export const getAssignedPatients = async (req, res) => {
    try {
        const doctorId = req.user._id;

        // Find patient IDs from appointments
        const appointmentPatientIds = await Appointment.find({ doctor: doctorId }).distinct("patient");
        
        // Find patient IDs from existing medical records
        const recordPatientIds = await MedicalRecord.find({ doctor: doctorId }).distinct("patient");

        // Combine unique patient IDs
        const uniquePatientIds = [...new Set([...appointmentPatientIds, ...recordPatientIds])];

        const patients = await User.find({ _id: { $in: uniquePatientIds } })
            .select("-password")
            .sort({ fullName: 1 });

        return res.status(200).json(patients);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Create a new medical record for an assigned patient
 * @route   POST /api/medical-records
 * @access  Private (Doctor)
 */
export const createMedicalRecord = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { patient, diagnosis, prescriptions, notes, recordDate } = req.body;

        // 1. Required field validation
        if (!patient || !diagnosis) {
            return res.status(400).json({
                message: "Patient ID and Diagnosis are required fields.",
            });
        }

        // 2. Validate ObjectId formats
        if (!mongoose.Types.ObjectId.isValid(patient)) {
            return res.status(400).json({ message: "Invalid Patient ID format." });
        }

        // 3. Verify Patient exists and is a Patient
        const patientUser = await User.findById(patient);
        if (!patientUser) {
            return res.status(404).json({ message: "Patient not found." });
        }

        // 4. Verify Doctor Access: Patient must be assigned to doctor
        const isAssigned = await isPatientAssignedToDoctor(doctorId, patient);
        if (!isAssigned) {
            return res.status(403).json({
                message: "Access Denied: You can only create medical records for patients assigned to you.",
            });
        }

        // 5. Validate prescription array structure if provided
        if (prescriptions && Array.isArray(prescriptions)) {
            for (let i = 0; i < prescriptions.length; i++) {
                const item = prescriptions[i];
                if (!item.medicineName || !item.dosage || !item.duration) {
                    return res.status(400).json({
                        message: `Prescription #${i + 1} must include medicineName, dosage, and duration.`,
                    });
                }
            }
        }

        // 6. Create Record
        const newRecord = new MedicalRecord({
            patient,
            doctor: doctorId,
            diagnosis: diagnosis.trim(),
            prescriptions: prescriptions || [],
            notes: notes || "",
            createdAt: recordDate ? new Date(recordDate) : undefined,
        });

        const savedRecord = await newRecord.save();

        const populatedRecord = await MedicalRecord.findById(savedRecord._id)
            .populate("patient", "fullName email phone gender dob address")
            .populate("doctor", "fullName email phone specialization department");

        return res.status(201).json(populatedRecord);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Get all medical records created by logged-in doctor
 * @route   GET /api/medical-records
 * @access  Private (Doctor)
 */
export const getDoctorMedicalRecords = async (req, res) => {
    try {
        const doctorId = req.user._id;

        const records = await MedicalRecord.find({ doctor: doctorId })
            .populate("patient", "fullName email phone gender dob address")
            .populate("doctor", "fullName email phone specialization department")
            .sort({ createdAt: -1 });

        return res.status(200).json(records);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Get medical records for a specific assigned patient
 * @route   GET /api/medical-records/patient/:patientId
 * @access  Private (Doctor)
 */
export const getPatientMedicalRecords = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: "Invalid Patient ID format." });
        }

        // Verify Doctor Access
        const isAssigned = await isPatientAssignedToDoctor(doctorId, patientId);
        if (!isAssigned) {
            return res.status(403).json({
                message: "Access Denied: You can only view records for patients assigned to you.",
            });
        }

        const records = await MedicalRecord.find({ patient: patientId, doctor: doctorId })
            .populate("patient", "fullName email phone gender dob address")
            .populate("doctor", "fullName email phone specialization department")
            .sort({ createdAt: -1 });

        return res.status(200).json(records);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Get single medical record details by ID
 * @route   GET /api/medical-records/:id
 * @access  Private (Doctor)
 */
export const getMedicalRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Record ID format." });
        }

        const record = await MedicalRecord.findById(id)
            .populate("patient", "fullName email phone gender dob address")
            .populate("doctor", "fullName email phone specialization department");

        if (!record) {
            return res.status(404).json({ message: "Medical record not found." });
        }

        // Doctor Authorization Check
        if (record.doctor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access Denied: You are not authorized to view this record." });
        }

        return res.status(200).json(record);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Edit/Update an existing medical record
 * @route   PUT /api/medical-records/:id
 * @access  Private (Doctor)
 */
export const updateMedicalRecord = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { id } = req.params;
        const { diagnosis, prescriptions, notes, recordDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Record ID format." });
        }

        const record = await MedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({ message: "Medical record not found." });
        }

        // Verify Doctor ownership
        if (record.doctor.toString() !== doctorId.toString()) {
            return res.status(403).json({
                message: "Access Denied: You can only edit records created by you.",
            });
        }

        if (diagnosis !== undefined) {
            if (!diagnosis.trim()) {
                return res.status(400).json({ message: "Diagnosis cannot be empty." });
            }
            record.diagnosis = diagnosis.trim();
        }

        if (prescriptions !== undefined && Array.isArray(prescriptions)) {
            for (let i = 0; i < prescriptions.length; i++) {
                const item = prescriptions[i];
                if (!item.medicineName || !item.dosage || !item.duration) {
                    return res.status(400).json({
                        message: `Prescription #${i + 1} must include medicineName, dosage, and duration.`,
                    });
                }
            }
            record.prescriptions = prescriptions;
        }

        if (notes !== undefined) {
            record.notes = notes;
        }

        if (recordDate) {
            record.createdAt = new Date(recordDate);
        }

        const updatedRecord = await record.save();

        const populatedRecord = await MedicalRecord.findById(updatedRecord._id)
            .populate("patient", "fullName email phone gender dob address")
            .populate("doctor", "fullName email phone specialization department");

        return res.status(200).json(populatedRecord);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};
