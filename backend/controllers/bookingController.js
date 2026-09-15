import Booking from "../models/bookingModel.js";
import Service from "../models/serviceModel.js";
import User from "../models/userModel.js";
import Provider from "../models/providerModel.js";
import Notification from "../models/notificationModel.js";
import { sendBookingReceipt, sendBookingCancellation, sendBookingStatusUpdateEmail } from "../services/emailService.js";

// @desc    Create a new service booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const { serviceId, providerId, bookingDate, timeSlot, address, notes } = req.body;

        if (!serviceId || !providerId || !bookingDate || !timeSlot || !address) {
            return res.status(400).json({
                message: "Please fill in all required fields: service, provider, date, time slot, and address",
            });
        }

        // Validate Service
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Selected service not found" });
        }
        if (!service.isAvailable) {
            return res.status(400).json({ message: "This service is currently unavailable" });
        }

        // Validate Provider User
        const providerUser = await User.findById(providerId);
        if (!providerUser) {
            return res.status(404).json({ message: "Selected provider not found" });
        }

        // Check Provider profile availability flag
        const providerProfile = await Provider.findOne({ user: providerId });
        if (providerProfile && !providerProfile.isAvailable) {
            return res.status(400).json({ message: "Selected provider is currently unavailable for bookings" });
        }

        // Parse date for conflict checking
        const targetDate = new Date(bookingDate);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // Check for time slot conflict for this provider
        const conflictingBooking = await Booking.findOne({
            provider: providerId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            timeSlot: timeSlot,
            status: { $nin: ["Cancelled", "Rejected"] },
        });

        if (conflictingBooking) {
            return res.status(400).json({
                message: `Provider ${providerUser.fullName} already has a booking scheduled for ${timeSlot} on this date. Please select another time slot or provider.`,
            });
        }

        // Calculate total price
        const totalPrice = service.price;

        const booking = new Booking({
            user: req.user._id,
            service: serviceId,
            provider: providerId,
            bookingDate: new Date(bookingDate),
            timeSlot,
            address,
            totalPrice,
            notes: notes || "",
            status: "Pending",
        });

        const createdBooking = await booking.save();

        // Create notification for Provider
        await Notification.create({
            user: providerId,
            title: "New Booking Request",
            message: `You have a new booking request for ${service.name} from ${req.user.fullName} on ${new Date(bookingDate).toLocaleDateString()} at ${timeSlot}.`,
            type: "BOOKING",
        });

        // Create notification for User
        await Notification.create({
            user: req.user._id,
            title: "Booking Submitted",
            message: `Your booking for ${service.name} has been submitted successfully and is currently Pending confirmation.`,
            type: "BOOKING",
        });

        const populatedBooking = await Booking.findById(createdBooking._id)
            .populate("service", "name category price duration image")
            .populate("provider", "fullName email phone specialization")
            .populate("user", "fullName email phone");

        // ✅ Return the booking response IMMEDIATELY — do not wait for email.
        // Email is dispatched asynchronously so a slow/blocked SMTP server
        // (e.g. Render blocking outbound port 465/587) never hangs the checkout.
        res.status(201).json({
            ...populatedBooking.toObject(),
            emailDeliveryStatus: "Pending",
        });

        // Send Email Receipt in the background (fire-and-forget)
        sendBookingReceipt(
            populatedBooking,
            req.user.email,
            req.user.fullName
        ).catch((err) =>
            console.error("Booking receipt email error (non-blocking):", err.message)
        );
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Failed to create booking", error: error.message });
    }
};

// @desc    Get logged in user's service bookings
// @route   GET /api/bookings/user
// @access  Private
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("service", "name category price duration image rating")
            .populate("provider", "fullName email phone specialization")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// @desc    Get logged in provider's assigned service bookings
// @route   GET /api/bookings/provider
// @access  Private (Doctor / Admin / Provider)
export const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user._id })
            .populate("service", "name category price duration image")
            .populate("user", "fullName email phone address")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching provider bookings:", error);
        res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
};

// @desc    Get all service bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
    try {
        const { status, search } = req.query;

        let query = {};
        if (status && status !== "All") {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate("service", "name category price duration")
            .populate("provider", "fullName email phone specialization")
            .populate("user", "fullName email phone")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: "Failed to fetch all bookings" });
    }
};

// @desc    Update booking status (Pending -> Accepted -> On The Way -> Started -> Completed or Rejected)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider / Admin)
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = [
            "Pending",
            "Accepted",
            "On The Way",
            "Started",
            "Completed",
            "Cancelled",
            "Rejected",
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid booking status" });
        }

        const booking = await Booking.findById(req.params.id)
            .populate("service", "name")
            .populate("provider", "fullName");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify authorization: Must be the assigned provider or Admin
        if (
            booking.provider._id.toString() !== req.user._id.toString() &&
            req.user.role !== "Admin"
        ) {
            return res.status(403).json({ message: "Not authorized to update this booking status" });
        }

        booking.status = status;
        const updatedBooking = await booking.save();

        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate("service", "name category price duration")
            .populate("provider", "fullName email phone specialization")
            .populate("user", "fullName email phone");

        // Create Notification for User
        await Notification.create({
            user: booking.user,
            title: `Booking Update: ${status}`,
            message: `Your booking for ${populatedBooking?.service?.name || "Service"} has been updated to "${status}".`,
            type: "STATUS_UPDATE",
        });

        // Send Email Notification to User (non-blocking)
        if (populatedBooking && populatedBooking.user?.email) {
            sendBookingStatusUpdateEmail(
                populatedBooking,
                populatedBooking.user.email,
                populatedBooking.user.fullName,
                status
            ).catch((err) => console.error("Booking status email error:", err.message));
        }

        res.json(populatedBooking);
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Failed to update booking status" });
    }
};

// @desc    Cancel booking by Patient/User
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("service", "name category")
            .populate("provider", "fullName");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        if (["Completed", "Cancelled", "Rejected"].includes(booking.status)) {
            return res.status(400).json({
                message: `Booking cannot be cancelled because it is already ${booking.status}`,
            });
        }

        booking.status = "Cancelled";
        const updatedBooking = await booking.save();

        // Notify Provider
        await Notification.create({
            user: booking.provider,
            title: "Booking Cancelled",
            message: `Booking for ${booking.service?.name} was cancelled by the user.`,
            type: "CANCELLED",
        });

        // ✅ Return response IMMEDIATELY — do not wait for email.
        res.json(updatedBooking);

        // Send Cancellation Email in the background (fire-and-forget)
        sendBookingCancellation(
            updatedBooking,
            req.user.email,
            req.user.fullName
        ).catch((err) =>
            console.error("Cancellation email error (non-blocking):", err.message)
        );
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Failed to cancel booking" });
    }
};

// @desc    Resend booking receipt via email
// @route   POST /api/bookings/:id/send-receipt
// @access  Private
export const resendReceipt = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("service", "name category price")
            .populate("provider", "fullName")
            .populate("user", "fullName email");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify authorization
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
            return res.status(403).json({ message: "Not authorized to access this receipt" });
        }

        const emailSent = await sendBookingReceipt(
            booking,
            booking.user.email,
            booking.user.fullName
        );

        if (emailSent) {
            res.json({ message: "Receipt resent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send email receipt. Please check server configuration." });
        }
    } catch (error) {
        console.error("Error resending receipt:", error);
        res.status(500).json({ message: "Server error while resending receipt" });
    }
};

// @desc    Get booking receipt details
// @route   GET /api/bookings/:id/receipt
// @access  Private
export const getReceipt = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("service", "name category price duration")
            .populate("provider", "fullName email phone specialization")
            .populate("user", "fullName email phone address");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify authorization
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
            return res.status(403).json({ message: "Not authorized to view this receipt" });
        }

        res.json(booking);
    } catch (error) {
        console.error("Error fetching receipt:", error);
        res.status(500).json({ message: "Failed to fetch receipt" });
    }
};

