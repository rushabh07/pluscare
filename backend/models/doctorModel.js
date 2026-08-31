import mongoose from "mongoose";

// Schema for Doctor details linked to User profile
const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        specialization: {
            type: String,
            required: [true, "Doctor specialization is required"],
            trim: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
        departmentName: {
            type: String,
            default: "",
        },
        qualification: {
            type: String,
            default: "MBBS",
        },
        experienceYears: {
            type: Number,
            default: 0,
        },
        consultationFee: {
            type: Number,
            required: true,
            default: 50,
        },
        availability: [
            {
                day: {
                    type: String,
                    enum: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                },
                slots: [{ type: String }],
            },
        ],
        roomNumber: {
            type: String,
            default: "101",
        },
        status: {
            type: String,
            enum: ["Active", "On Leave", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
