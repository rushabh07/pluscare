import Service from "../models/serviceModel.js";
import Provider from "../models/providerModel.js";
import Booking from "../models/bookingModel.js";
import Review from "../models/reviewModel.js";

// @desc    Get live service module statistics from MongoDB
// @route   GET /api/admin/stats/services
// @access  Private/Admin
export const getServiceStats = async (req, res) => {
    try {
        const totalServices = await Service.countDocuments();
        const activeServices = await Service.countDocuments({ isAvailable: true });
        const categoriesCount = (await Service.distinct("category")).length;

        const totalProviders = await Provider.countDocuments();
        const activeProviders = await Provider.countDocuments({ isAvailable: true });

        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: "Completed" });
        const pendingBookings = await Booking.countDocuments({ status: "Pending" });
        const activeBookings = await Booking.countDocuments({
            status: { $in: ["Accepted", "On The Way", "Started"] },
        });
        const cancelledBookings = await Booking.countDocuments({ status: { $in: ["Cancelled", "Rejected"] } });

        // Total revenue from completed/accepted bookings
        const revenueResult = await Booking.aggregate([
            { $match: { status: { $in: ["Completed", "Started", "On The Way", "Accepted"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Average rating across all services
        const ratingResult = await Service.aggregate([
            { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]);
        const avgRating = ratingResult.length > 0 ? parseFloat(ratingResult[0].avgRating.toFixed(1)) : 0;

        const totalReviews = await Review.countDocuments();

        res.json({
            totalServices,
            activeServices,
            categoriesCount,
            totalProviders,
            activeProviders,
            totalBookings,
            completedBookings,
            pendingBookings,
            activeBookings,
            cancelledBookings,
            totalRevenue,
            avgRating,
            totalReviews,
        });
    } catch (error) {
        console.error("Error fetching admin service stats:", error);
        res.status(500).json({ message: "Failed to fetch admin service statistics" });
    }
};
