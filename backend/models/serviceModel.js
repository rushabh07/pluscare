import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Service name is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Service category is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Service description is required"],
        },
        price: {
            type: Number,
            required: [true, "Service price is required"],
            min: 0,
        },
        duration: {
            type: Number,
            default: 30, // Duration in minutes
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
        },
        providers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
