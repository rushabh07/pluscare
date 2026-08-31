import mongoose from "mongoose";

/**
 * Department Model
 * Represents hospital departments (e.g., Cardiology, Neurology, etc.)
 */
const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Department name is required"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        headDoctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        totalDoctors: {
            type: Number,
            default: 0,
        },
        totalPatients: {
            type: Number,
            default: 0,
        },
        location: {
            type: String,
            default: "",
            trim: true,
        },
        contactNumber: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        icon: {
            type: String,
            default: "🏥",
        },
    },
    {
        timestamps: true,
    }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
