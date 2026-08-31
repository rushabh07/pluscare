import mongoose from "mongoose";

// Define Appointment Schema
const appointmentSchema = new mongoose.Schema(
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
        appointmentDate: {
            type: Date,
            required: [true, "Appointment date is required"],
        },
        timeSlot: {
            type: String,
            required: [true, "Time slot is required"],
        },
        department: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            default: "General Checkup",
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
            default: "Pending",
        },
        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
