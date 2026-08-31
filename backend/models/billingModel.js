import mongoose from "mongoose";

const billingItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity:    { type: Number, required: true, default: 1 },
    unitPrice:   { type: Number, required: true },
    total:       { type: Number, required: true },
});

const billingSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        invoiceNumber: {
            type: String,
            unique: true,
        },
        items: [billingItemSchema],
        subTotal:    { type: Number, required: true, default: 0 },
        tax:         { type: Number, default: 0 },
        discount:    { type: Number, default: 0 },
        totalAmount: { type: Number, required: true, default: 0 },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Partially Paid", "Cancelled"],
            default: "Pending",
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "Card", "Insurance", "Online", "Other"],
        },
        paidAt:   { type: Date },
        notes:    { type: String },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// Auto-generate invoice number before saving
billingSchema.pre("save", async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model("Billing").countDocuments();
        this.invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;
    }
    next();
});

const Billing = mongoose.model("Billing", billingSchema);
export default Billing;
