import Review from "../models/reviewModel.js";
import Booking from "../models/bookingModel.js";
import Service from "../models/serviceModel.js";
import Provider from "../models/providerModel.js";

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Patient/User)
export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating || !comment) {
            return res.status(400).json({ message: "Booking ID, rating (1-5), and comment are required" });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify booking belongs to user
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to review this booking" });
        }

        // Verify booking status is Completed
        if (booking.status !== "Completed") {
            return res.status(400).json({
                message: "Reviews can only be submitted after a service booking is Completed",
            });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already submitted a review for this booking" });
        }

        const review = new Review({
            booking: bookingId,
            user: req.user._id,
            service: booking.service,
            provider: booking.provider,
            rating: numRating,
            comment,
        });

        const createdReview = await review.save();

        // 1. Update Service Rating
        const serviceReviews = await Review.find({ service: booking.service });
        const serviceAvg =
            serviceReviews.reduce((acc, item) => acc + item.rating, 0) / serviceReviews.length;

        await Service.findByIdAndUpdate(booking.service, {
            rating: parseFloat(serviceAvg.toFixed(1)),
            numReviews: serviceReviews.length,
        });

        // 2. Update Provider Profile Rating
        const providerReviews = await Review.find({ provider: booking.provider });
        const providerAvg =
            providerReviews.reduce((acc, item) => acc + item.rating, 0) / providerReviews.length;

        await Provider.findOneAndUpdate(
            { user: booking.provider },
            {
                rating: parseFloat(providerAvg.toFixed(1)),
                numReviews: providerReviews.length,
            }
        );

        const populatedReview = await Review.findById(createdReview._id)
            .populate("user", "fullName")
            .populate("service", "name");

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review", error: error.message });
    }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ service: req.params.serviceId })
            .populate("user", "fullName")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching service reviews:", error);
        res.status(500).json({ message: "Failed to fetch service reviews" });
    }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate("user", "fullName")
            .populate("service", "name category")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching provider reviews:", error);
        res.status(500).json({ message: "Failed to fetch provider reviews" });
    }
};
