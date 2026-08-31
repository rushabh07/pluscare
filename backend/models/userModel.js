import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define User Schema for Hospital Management System
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            default: "Male",
        },
        dob: {
            type: Date,
        },
        role: {
            type: String,
            enum: ["Patient", "Doctor", "Admin"],
            default: "Patient",
        },
        address: {
            type: String,
            default: "",
        },
        specialization: {
            type: String, // Applicable for doctors
            default: "",
        },
        department: {
            type: String, // Applicable for doctors / staff
            default: "",
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
