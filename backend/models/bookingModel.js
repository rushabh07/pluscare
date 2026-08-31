import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Booking user is required"],
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: [true, "Service is required"],
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Provider is required"],
        },
        bookingDate: {
            type: Date,
            required: [true, "Booking date is required"],
        },
        timeSlot: {
            type: String,
            required: [true, "Time slot is required"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "On The Way",
                "Started",
                "Completed",
                "Cancelled",
                "Rejected",
            ],
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

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
