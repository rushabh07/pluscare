import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        // Category maps directly to service category (e.g. "Cardiology", "Dental Care")
        category: {
            type: String,
            trim: true,
            default: "",
        },
        // Specialization title (e.g. "Cardiologist", "Dentist")
        specialization: {
            type: String,
            trim: true,
            default: "",
        },
        qualification: {
            type: String,
            trim: true,
            default: "MBBS",
        },
        profileImage: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            trim: true,
            default: "",
        },
        consultationFee: {
            type: Number,
            default: 500,
        },
        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        experienceYears: {
            type: Number,
            default: 1,
        },
        rating: {
            type: Number,
            default: 5.0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
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
        isAvailable: {
            type: Boolean,
            default: true,
        },
        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Provider = mongoose.model("Provider", providerSchema);

export default Provider;
