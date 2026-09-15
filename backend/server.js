import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────
// origin: "*" allows all origins (Vercel, localhost, etc.).
// Production frontend: https://pluscare-rho.vercel.app
// ──────────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/stats", adminStatsRoutes);

// Root Route
app.get("/", (req, res) => {
    res.json({ message: "PlusCare Hospital Management API is running..." });
});

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ message: "API Route Not Found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`PlusCare Server running on port ${PORT}`);
});
