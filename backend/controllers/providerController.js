import Provider from "../models/providerModel.js";
import User from "../models/userModel.js";
import Service from "../models/serviceModel.js";
import Booking from "../models/bookingModel.js";

// @desc    Get all service providers (optionally filter by category, serviceId, isAvailable)
// @route   GET /api/providers
// @access  Public
export const getProviders = async (req, res) => {
    try {
        const { serviceId, isAvailable, category } = req.query;

        let query = {};

        if (isAvailable !== undefined && isAvailable !== "all") {
            query.isAvailable = isAvailable === "true" || isAvailable === true;
        }

        if (serviceId) {
            query.services = serviceId;
        }

        if (category && category !== "All") {
            query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        const providers = await Provider.find(query)
            .populate("user", "fullName email phone specialization role address")
            .populate("services", "name category price");

        res.json(providers);
    } catch (error) {
        console.error("Error fetching providers:", error);
        res.status(500).json({ message: "Failed to fetch service providers" });
    }
};

// @desc    Get providers filtered by service category
// @route   GET /api/providers/category/:category
// @access  Public
export const getProvidersByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }

        const providers = await Provider.find({
            category: { $regex: new RegExp(`^${category}$`, "i") },
            isAvailable: true,
        })
            .populate(
                "user",
                "fullName email phone specialization role address department"
            )
            .populate("services", "name category price description duration image rating")
            .sort({ rating: -1 });

        res.json(providers);
    } catch (error) {
        console.error("Error fetching providers by category:", error);
        res.status(500).json({ message: "Failed to fetch providers for this category" });
    }
};

// @desc    Get single provider details by user/provider ID
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = async (req, res) => {
    try {
        let provider = await Provider.findById(req.params.id)
            .populate(
                "user",
                "fullName email phone specialization role address department"
            )
            .populate(
                "services",
                "name category price description duration image rating"
            );

        // If not found by Provider ID, try by User ID
        if (!provider) {
            provider = await Provider.findOne({ user: req.params.id })
                .populate(
                    "user",
                    "fullName email phone specialization role address department"
                )
                .populate(
                    "services",
                    "name category price description duration image rating"
                );
        }

        if (!provider) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        res.json(provider);
    } catch (error) {
        console.error("Error fetching provider by ID:", error);
        res.status(500).json({ message: "Failed to fetch provider details" });
    }
};

// @desc    Get provider availability for a specific date (returns available slots minus booked ones)
// @route   GET /api/providers/:id/availability
// @access  Public
export const getProviderAvailability = async (req, res) => {
    try {
        const { date } = req.query; // expected: YYYY-MM-DD

        let provider = await Provider.findById(req.params.id);
        if (!provider) {
            provider = await Provider.findOne({ user: req.params.id });
        }

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        if (!provider.isAvailable) {
            return res.json({ slots: [], isAvailable: false });
        }

        let allSlots = [];

        if (date) {
            const dateObj = new Date(date);
            const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            const dayName = dayNames[dateObj.getDay()];

            const dayAvail = provider.availability.find(
                (a) => a.day === dayName
            );
            allSlots = dayAvail
                ? dayAvail.slots
                : ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

            // Remove already-booked slots for this provider on this date
            const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
            const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

            const bookedSlots = await Booking.find({
                provider: provider.user,
                bookingDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $nin: ["Cancelled", "Rejected"] },
            }).select("timeSlot");

            const bookedSlotSet = new Set(bookedSlots.map((b) => b.timeSlot));
            const availableSlots = allSlots.filter(
                (slot) => !bookedSlotSet.has(slot)
            );

            return res.json({
                slots: availableSlots,
                allSlots,
                bookedSlots: [...bookedSlotSet],
                isAvailable: provider.isAvailable,
                dayName,
            });
        }

        // No date provided — return full weekly availability
        res.json({
            availability: provider.availability,
            isAvailable: provider.isAvailable,
        });
    } catch (error) {
        console.error("Error fetching provider availability:", error);
        res.status(500).json({ message: "Failed to fetch provider availability" });
    }
};

// @desc    Create or Update provider profile
// @route   POST /api/providers
// @access  Private/Admin or Doctor
export const upsertProvider = async (req, res) => {
    try {
        const {
            userId,
            category,
            specialization,
            qualification,
            profileImage,
            location,
            consultationFee,
            skills,
            experienceYears,
            availability,
            isAvailable,
            services,
        } = req.body;

        const targetUserId = userId || req.user._id;

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let provider = await Provider.findOne({ user: targetUserId });

        if (provider) {
            if (category !== undefined) provider.category = category;
            if (specialization !== undefined) provider.specialization = specialization;
            if (qualification !== undefined) provider.qualification = qualification;
            if (profileImage !== undefined) provider.profileImage = profileImage;
            if (location !== undefined) provider.location = location;
            if (consultationFee !== undefined) provider.consultationFee = consultationFee;
            if (skills) provider.skills = skills;
            if (experienceYears !== undefined) provider.experienceYears = experienceYears;
            if (availability) provider.availability = availability;
            if (isAvailable !== undefined) provider.isAvailable = isAvailable;
            if (services) provider.services = services;
            await provider.save();
        } else {
            provider = new Provider({
                user: targetUserId,
                category: category || "",
                specialization: specialization || user.specialization || "General Specialist",
                qualification: qualification || "MBBS",
                profileImage: profileImage || "",
                location: location || user.address || "",
                consultationFee: consultationFee || 500,
                skills: skills || ["General Service", "Patient Care"],
                experienceYears: experienceYears || 3,
                availability: availability || [
                    { day: "Monday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
                    { day: "Tuesday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
                    { day: "Wednesday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
                    { day: "Thursday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
                    { day: "Friday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
                ],
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                services: services || [],
            });
            await provider.save();
        }

        const populatedProvider = await Provider.findById(provider._id)
            .populate("user", "fullName email phone specialization")
            .populate("services", "name category price");

        res.status(200).json(populatedProvider);
    } catch (error) {
        console.error("Error creating/updating provider:", error);
        res.status(500).json({ message: "Failed to save provider profile" });
    }
};
