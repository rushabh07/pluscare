import User from "../models/userModel.js";
import Provider from "../models/providerModel.js";
import { generateToken } from "../utils/generateToken.js";
import {
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    sendLoginNotificationEmail,
    sendRegisterNotificationEmail,
} from "../services/emailService.js";

/**
 * @desc    Register a new user (Patient, Doctor, Receptionist, Admin)
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, gender, dob, role, address, password, specialization, department } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            phone,
            gender: gender || "Male",
            dob: dob || null,
            role: role || "Patient",
            address: address || "",
            specialization: specialization || "",
            department: department || "",
            password,
        });

        if (user) {
            // Send Register Welcome Email (non-blocking)
            sendRegisterNotificationEmail(user.email, user.fullName, user.role).catch((err) =>
                console.error("Register email error:", err.message)
            );

            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Optional role check if passed from frontend
            if (role && user.role !== role) {
                return res.status(401).json({
                    message: `Role mismatch. You registered as ${user.role}, not ${role}`,
                });
            }

            // Send Login Security Notification Email (non-blocking)
            sendLoginNotificationEmail(user.email, user.fullName, { ip: req.ip }).catch((err) =>
                console.error("Login notification email error:", err.message)
            );

            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Send OTP for Forgot Password via Supabase SMTP
 * @route   POST /api/users/forgot-password/send-otp
 * @access  Public
 */
export const sendForgotPasswordOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email address." });
        }

        const result = await sendForgotPasswordOtp(email);
        if (result.success) {
            return res.json({ message: "6-digit OTP code has been sent to your email address." });
        } else {
            return res.status(500).json({
                message: result.message || "Failed to send OTP code. Please try again later.",
            });
        }
    } catch (error) {
        console.error("Error sending forgot password OTP:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Verify OTP and Reset Password via Supabase Auth & MongoDB
 * @route   POST /api/users/forgot-password/verify-otp
 * @access  Public
 */
export const resetPasswordWithOtpController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP token, and new password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        // Verify OTP via Supabase
        const otpResult = await verifyForgotPasswordOtp(email, otp);
        if (!otpResult.success) {
            return res.status(400).json({
                message: otpResult.message || "Invalid or expired OTP token. Please check and try again.",
            });
        }

        // Find user in MongoDB and update password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully! You can now log in with your new password." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            // If user is a Doctor, fetch extra provider attributes
            if (user.role === "Doctor") {
                const provider = await Provider.findOne({ user: user._id });
                if (provider) {
                    return res.json({
                        ...user.toObject(),
                        qualification: provider.qualification,
                        location: provider.location,
                        consultationFee: provider.consultationFee,
                        experienceYears: provider.experienceYears,
                        isAvailable: provider.isAvailable,
                    });
                }
            }
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update logged in user profile & role-specific details
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const {
            fullName,
            phone,
            gender,
            dob,
            address,
            specialization,
            department,
            currentPassword,
            newPassword,
            qualification,
            location,
            consultationFee,
            experienceYears,
            isAvailable,
        } = req.body;

        // Update core user details
        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (gender !== undefined) user.gender = gender;
        if (dob !== undefined) user.dob = dob;
        if (address !== undefined) user.address = address;
        if (specialization !== undefined) user.specialization = specialization;
        if (department !== undefined) user.department = department;

        // Handle password update
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password does not match." });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long." });
            }
            user.password = newPassword;
        }

        const updatedUser = await user.save();

        let extraFields = {};

        // If user is a Doctor, sync Provider document
        if (user.role === "Doctor") {
            const providerFields = {};
            if (specialization !== undefined) providerFields.specialization = specialization;
            if (department !== undefined) providerFields.category = department;
            if (qualification !== undefined) providerFields.qualification = qualification;
            if (location !== undefined || address !== undefined) providerFields.location = location || address;
            if (consultationFee !== undefined) providerFields.consultationFee = Number(consultationFee);
            if (experienceYears !== undefined) providerFields.experienceYears = Number(experienceYears);
            if (isAvailable !== undefined) providerFields.isAvailable = Boolean(isAvailable);

            const provider = await Provider.findOneAndUpdate(
                { user: user._id },
                { $set: providerFields },
                { new: true, upsert: true }
            );

            if (provider) {
                extraFields = {
                    qualification: provider.qualification,
                    location: provider.location,
                    consultationFee: provider.consultationFee,
                    experienceYears: provider.experienceYears,
                    isAvailable: provider.isAvailable,
                };
            }
        }

        res.json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            gender: updatedUser.gender,
            dob: updatedUser.dob,
            role: updatedUser.role,
            address: updatedUser.address,
            specialization: updatedUser.specialization,
            department: updatedUser.department,
            ...extraFields,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all doctors list
 * @route   GET /api/users/doctors
 * @access  Public
 */
export const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: "Doctor" }).select("-password");
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
