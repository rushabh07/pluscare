import { chatWithAI, analyzeSymptomsAndTriage, checkSlotAvailability, nvidiaChat } from "../services/aiService.js";
import Appointment from "../models/appointmentModel.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

/**
 * @desc    Handle AI Assistant Chat
 * @route   POST /api/ai/chat
 * @access  Private / Optional
 */
export const handleNvidiaChat = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid list of messages for the AI chat.",
            });
        }
        const reply = await nvidiaChat(messages);
        return res.status(200).json({
            success: true,
            reply,
        });
    } catch (error) {
        console.error("Nvidia AI Controller Chat Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while processing the Nvidia AI chat.",
        });
    }
};

export const handleAIChat = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid list of messages for the AI chat.",
            });
        }
        const reply = await chatWithAI(messages);
        // Optionally persist chat history to MongoDB if authenticated user is present
        if (req.user && req.user._id) {
            try {
                let userChat = await Chat.findOne({ user: req.user._id });
                const lastUserMsg = messages[messages.length - 1]?.content || messages[messages.length - 1]?.text;
                if (!userChat) {
                    userChat = new Chat({
                        user: req.user._id,
                        title: "PlusCare Health Chat",
                        messages: [
                            { role: "user", content: lastUserMsg },
                            { role: "assistant", content: reply },
                        ],
                    });
                } else {
                    userChat.messages.push(
                        { role: "user", content: lastUserMsg },
                        { role: "assistant", content: reply }
                    );
                }
                await userChat.save();
            } catch (dbError) {
                console.error("Failed to persist chat history:", dbError.message);
            }
        }
        return res.status(200).json({
            success: true,
            reply,
        });
    } catch (error) {
        console.error("AI Controller Chat Error:", error);
        if (error?.response?.status === 429 || error?.code === "insufficient_quota") {
            return res.status(429).json({
                success: false,
                message: "The AI service is currently at capacity. Please try again later.",
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while processing the AI chat.",
        });
    }
};




/**
 * @desc    Analyze symptoms and recommend department, doctor, and slots
 * @route   POST /api/ai/triage
 * @access  Private
 */
export const handleAITriage = async (req, res) => {
    try {
        const { symptom } = req.body;

        if (!symptom || typeof symptom !== "string" || symptom.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please describe your symptoms to receive an AI recommendation.",
            });
        }

        const triageData = await analyzeSymptomsAndTriage(symptom.trim());

        return res.status(200).json({
            success: true,
            triage: triageData,
        });
    } catch (error) {
        console.error("AI Controller Triage Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while analyzing symptoms.",
        });
    }
};

/**
 * @desc    Book Smart Appointment with double-booking prevention
 * @route   POST /api/ai/book
 * @access  Private
 */
export const handleSmartBooking = async (req, res) => {
    try {
        const { doctorId, department, appointmentDate, timeSlot, reason, notes } = req.body;

        if (!doctorId || !appointmentDate || !timeSlot || !department) {
            return res.status(400).json({
                success: false,
                message: "Doctor, Department, Appointment Date, and Time Slot are required fields.",
            });
        }

        // Determine patient ID from req.user
        const patientId = req.user ? req.user._id : req.body.patientId;
        if (!patientId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required to complete booking.",
            });
        }

        // Check for double booking
        const isAvailable = await checkSlotAvailability(doctorId, appointmentDate, timeSlot);
        if (!isAvailable) {
            return res.status(409).json({
                success: false,
                message: "This appointment time slot is already reserved for the selected doctor. Please select another slot.",
            });
        }

        // Save appointment to MongoDB
        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            department: department,
            appointmentDate: new Date(appointmentDate),
            timeSlot: timeSlot,
            reason: reason || "AI Smart Booking",
            notes: notes || "Booked via PlusCare AI Assistant",
            status: "Confirmed",
        });

        await appointment.save();

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment,
        });
    } catch (error) {
        console.error("AI Controller Booking Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while creating the appointment.",
        });
    }
};
