import Service from "../models/serviceModel.js";
import Provider from "../models/providerModel.js";
import Review from "../models/reviewModel.js";

// @desc    Get all services with filtering, searching, sorting, and pagination
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            isAvailable,
            sortBy,
            page = 1,
            limit = 10,
        } = req.query;

        let query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        // Category filter
        if (category && category !== "All") {
            query.category = category;
        }

        // Availability filter
        if (isAvailable !== undefined && isAvailable !== "all") {
            query.isAvailable = isAvailable === "true" || isAvailable === true;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sorting options
        let sort = {};
        if (sortBy === "price_asc") sort.price = 1;
        else if (sortBy === "price_desc") sort.price = -1;
        else if (sortBy === "rating_desc") sort.rating = -1;
        else sort.createdAt = -1; // Default newest first

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const totalServices = await Service.countDocuments(query);
        const services = await Service.find(query)
            .populate("providers", "fullName email phone specialization")
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        res.json({
            services,
            page: pageNum,
            pages: Math.ceil(totalServices / limitNum) || 1,
            totalServices,
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ message: "Failed to fetch services", error: error.message });
    }
};

// @desc    Get all unique service categories
// @route   GET /api/services/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Service.distinct("category");
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

// @desc    Get single service by ID — includes category-filtered providers + reviews
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate(
            "providers",
            "fullName email phone specialization address"
        );

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // PRIMARY: fetch providers by category (so any doctor in this category shows up)
        let categoryProviders = [];
        if (service.category) {
            categoryProviders = await Provider.find({
                category: { $regex: new RegExp(`^${service.category}$`, "i") },
                isAvailable: true,
            })
                .populate(
                    "user",
                    "fullName email phone specialization role address department"
                )
                .sort({ rating: -1 });
        }

        // FALLBACK: if no category-matched providers, use the providers[] array on the service
        let providerProfiles = categoryProviders;

        if (providerProfiles.length === 0 && service.providers && service.providers.length > 0) {
            providerProfiles = await Provider.find({
                user: { $in: service.providers.map((p) => p._id || p) },
            }).populate(
                "user",
                "fullName email phone specialization role address department"
            );
        }

        // Fetch reviews for this service
        const reviews = await Review.find({ service: service._id })
            .populate("user", "fullName")
            .sort({ createdAt: -1 });

        res.json({
            service,
            providerProfiles,
            reviews,
        });
    } catch (error) {
        console.error("Error fetching service details:", error);
        res.status(500).json({ message: "Failed to fetch service details" });
    }
};

// @desc    Create a new service (Admin)
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
    try {
        const { name, category, description, price, duration, image, providers, isAvailable } = req.body;

        if (!name || !category || !description || price === undefined) {
            return res.status(400).json({ message: "Name, category, description, and price are required" });
        }

        const service = new Service({
            name,
            category,
            description,
            price: Number(price),
            duration: Number(duration) || 30,
            image: image || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
            providers: providers || [],
            isAvailable: isAvailable !== undefined ? isAvailable : true,
        });

        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service", error: error.message });
    }
};

// @desc    Update a service (Admin)
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const { name, category, description, price, duration, image, providers, isAvailable } = req.body;

        if (name) service.name = name;
        if (category) service.category = category;
        if (description) service.description = description;
        if (price !== undefined) service.price = Number(price);
        if (duration !== undefined) service.duration = Number(duration);
        if (image) service.image = image;
        if (providers) service.providers = providers;
        if (isAvailable !== undefined) service.isAvailable = isAvailable;

        const updatedService = await service.save();
        res.json(updatedService);
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ message: "Failed to update service" });
    }
};

// @desc    Delete a service (Admin)
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        await Service.deleteOne({ _id: service._id });
        res.json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).json({ message: "Failed to delete service" });
    }
};
