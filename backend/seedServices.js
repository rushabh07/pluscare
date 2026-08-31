import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import Doctor from "./models/doctorModel.js";
import Service from "./models/serviceModel.js";
import Provider from "./models/providerModel.js";
import Booking from "./models/bookingModel.js";
import Review from "./models/reviewModel.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("🌱 Starting Service Module database seeding...");

        // 1. Ensure sample Doctor Users exist
        let doctor1 = await User.findOne({ email: "doctor1@pluscare.com" });
        if (!doctor1) {
            doctor1 = await User.create({
                fullName: "Dr. Sarah Jenkins",
                email: "doctor1@pluscare.com",
                phone: "+1 (555) 234-5678",
                password: "Password123!",
                role: "Doctor",
                specialization: "Cardiology & Vascular Medicine",
                department: "Cardiology",
                address: "San Francisco Medical Hub, Bldg B",
            });
        }

        let doctor2 = await User.findOne({ email: "doctor2@pluscare.com" });
        if (!doctor2) {
            doctor2 = await User.create({
                fullName: "Dr. Marcus Vance",
                email: "doctor2@pluscare.com",
                phone: "+1 (555) 345-6789",
                password: "Password123!",
                role: "Doctor",
                specialization: "General Medicine & Telehealth",
                department: "Telehealth",
                address: "Austin Health Plaza, Suite 400",
            });
        }

        let doctor3 = await User.findOne({ email: "doctor3@pluscare.com" });
        if (!doctor3) {
            doctor3 = await User.create({
                fullName: "Dr. Elena Rostova",
                email: "doctor3@pluscare.com",
                phone: "+1 (555) 456-7890",
                password: "Password123!",
                role: "Doctor",
                specialization: "Pediatrics & Child Wellness",
                department: "Pediatrics",
                address: "Chicago Children's Wing, Suite 102",
            });
        }

        // 2. Ensure Provider Profiles exist for these doctors
        const defaultSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM", "05:00 PM"];
        const weeklyAvailability = [
            { day: "Monday", slots: defaultSlots },
            { day: "Tuesday", slots: defaultSlots },
            { day: "Wednesday", slots: defaultSlots },
            { day: "Thursday", slots: defaultSlots },
            { day: "Friday", slots: defaultSlots },
            { day: "Saturday", slots: ["10:00 AM", "12:00 PM"] },
        ];

        let prov1 = await Provider.findOne({ user: doctor1._id });
        if (!prov1) {
            prov1 = await Provider.create({
                user: doctor1._id,
                skills: ["Coronary Angiography", "Echocardiogram", "Cardiac Telemetry"],
                experienceYears: 12,
                rating: 4.9,
                numReviews: 18,
                availability: weeklyAvailability,
                isAvailable: true,
            });
        }

        let prov2 = await Provider.findOne({ user: doctor2._id });
        if (!prov2) {
            prov2 = await Provider.create({
                user: doctor2._id,
                skills: ["Telehealth Consultation", "Symptom Triage", "Chronic Care Management"],
                experienceYears: 8,
                rating: 4.8,
                numReviews: 24,
                availability: weeklyAvailability,
                isAvailable: true,
            });
        }

        let prov3 = await Provider.findOne({ user: doctor3._id });
        if (!prov3) {
            prov3 = await Provider.create({
                user: doctor3._id,
                skills: ["Pediatric Diagnostics", "Child Immunization", "Growth & Development Track"],
                experienceYears: 10,
                rating: 4.95,
                numReviews: 30,
                availability: weeklyAvailability,
                isAvailable: true,
            });
        }

        // 3. Clear and seed Services
        await Service.deleteMany({});

        const servicesData = [
            {
                name: "Advanced Cardiac Assessment & ECG",
                category: "Cardiology",
                description: "Comprehensive 12-lead ECG evaluation, rhythm analysis, and specialist consultation for high-precision cardiovascular diagnostics.",
                price: 150,
                duration: 45,
                rating: 4.9,
                numReviews: 12,
                isAvailable: true,
                image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
                providers: [doctor1._id],
            },
            {
                name: "HD Video Telehealth Consultation",
                category: "Telehealth",
                description: "On-demand encrypted video consultation with board-certified physicians for immediate diagnosis, e-prescriptions, and specialist referrals.",
                price: 49,
                duration: 20,
                rating: 4.8,
                numReviews: 35,
                isAvailable: true,
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
                providers: [doctor2._id, doctor1._id],
            },
            {
                name: "Comprehensive Metabolic Lab Panel",
                category: "Diagnostics",
                description: "Full blood chemistry workup including lipid profile, glycemic markers, kidney function, and liver enzyme telemetry analysis.",
                price: 95,
                duration: 30,
                rating: 4.7,
                numReviews: 19,
                isAvailable: true,
                image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600",
                providers: [doctor2._id],
            },
            {
                name: "Pediatric Wellness & Growth Screening",
                category: "Pediatrics",
                description: "Holistic health physical examination, developmental milestone tracking, and preventive immunization planning for infants and children.",
                price: 80,
                duration: 40,
                rating: 5.0,
                numReviews: 22,
                isAvailable: true,
                image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
                providers: [doctor3._id],
            },
            {
                name: "Physiotherapy & Spinal Rehabilitation",
                category: "Rehabilitation",
                description: "Personalized musculoskeletal therapy, spinal alignment exercises, and post-operative joint rehabilitation guided by certified experts.",
                price: 110,
                duration: 60,
                rating: 4.85,
                numReviews: 14,
                isAvailable: true,
                image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
                providers: [doctor1._id, doctor2._id],
            },
            {
                name: "Clinical Dermatology & Skin Screening",
                category: "Dermatology",
                description: "Dermoscopic examination of skin anomalies, acne treatment protocols, and mole mapping for early melanoma detection.",
                price: 125,
                duration: 35,
                rating: 4.75,
                numReviews: 8,
                isAvailable: true,
                image: "https://images.unsplash.com/photo-1512290900673-700200885e33?auto=format&fit=crop&q=80&w=600",
                providers: [doctor2._id],
            },
        ];

        const createdServices = await Service.insertMany(servicesData);
        console.log(`✅ Inserted ${createdServices.length} Services.`);

        // Link services to providers
        prov1.services = [createdServices[0]._id, createdServices[1]._id, createdServices[4]._id];
        await prov1.save();

        prov2.services = [createdServices[1]._id, createdServices[2]._id, createdServices[4]._id, createdServices[5]._id];
        await prov2.save();

        prov3.services = [createdServices[3]._id];
        await prov3.save();

        console.log("✅ Linked Services to Providers.");

        // 4. Ensure a Patient user exists for testing
        let patient = await User.findOne({ role: "Patient" });
        if (!patient) {
            patient = await User.create({
                fullName: "Alice Johnson",
                email: "patient@pluscare.com",
                phone: "+1 (555) 987-6543",
                password: "Password123!",
                role: "Patient",
                address: "742 Evergreen Terrace, Springfield",
            });
        }

        // 5. Seed sample bookings
        const sampleDate = new Date();
        sampleDate.setDate(sampleDate.getDate() - 2); // 2 days ago

        const existingBookings = await Booking.countDocuments();
        if (existingBookings === 0) {
            const completedBooking = await Booking.create({
                user: patient._id,
                service: createdServices[0]._id,
                provider: doctor1._id,
                bookingDate: sampleDate,
                timeSlot: "10:30 AM",
                address: "742 Evergreen Terrace, Springfield",
                totalPrice: createdServices[0].price,
                status: "Completed",
                notes: "Routine cardiac checkup requested.",
            });

            await Booking.create({
                user: patient._id,
                service: createdServices[1]._id,
                provider: doctor2._id,
                bookingDate: new Date(),
                timeSlot: "02:00 PM",
                address: "742 Evergreen Terrace, Springfield",
                totalPrice: createdServices[1].price,
                status: "Accepted",
                notes: "Telehealth follow up for lab results.",
            });

            // Seed sample review for completed booking
            await Review.create({
                booking: completedBooking._id,
                user: patient._id,
                service: createdServices[0]._id,
                provider: doctor1._id,
                rating: 5,
                comment: "Dr. Jenkins was extremely thorough and attentive. The cardiac assessment gave me total peace of mind!",
            });

            console.log("✅ Seeded sample Bookings and verified Review.");
        }

        console.log("🎉 Service Module Database Seeding Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
};

seedDatabase();
