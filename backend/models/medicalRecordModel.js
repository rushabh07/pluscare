import mongoose from "mongoose";

// Define Medical Record / Prescription Schema
const medicalRecordSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        diagnosis: {
            type: String,
            required: [true, "Diagnosis is required"],
        },
        prescriptions: [
            {
                medicineName: { type: String, required: true },
                dosage: { type: String, required: true },
                duration: { type: String, required: true },
            },
        ],
        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
