/**
 * seedDoctors.js — Seeds 8 category-mapped doctors + 8 services into MongoDB
 *
 * Run with: node seedDoctors.js
 *
 * Category → Specialization mapping (per spec):
 *   Cardiology          → Cardiologist
 *   Dental Care         → Dentist
 *   Skin Care           → Dermatologist
 *   Eye Care            → Ophthalmologist
 *   Physiotherapy       → Physiotherapist
 *   Mental Health       → Psychologist/Psychiatrist
 *   Orthopedic Care     → Orthopedic Specialist
 *   General Consultation→ General Physician
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import Provider from "./models/providerModel.js";
import Service from "./models/serviceModel.js";

dotenv.config();

const WEEKLY_SLOTS = {
    standard: [
        "09:00 AM", "10:00 AM", "11:00 AM",
        "12:00 PM", "02:00 PM", "03:00 PM",
        "04:00 PM", "05:00 PM",
    ],
    limited: ["10:00 AM", "12:00 PM", "03:00 PM"],
};

const buildWeeklyAvailability = (slots = WEEKLY_SLOTS.standard, includeSaturday = true) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const avail = days.map((day) => ({ day, slots }));
    if (includeSaturday) {
        avail.push({ day: "Saturday", slots: WEEKLY_SLOTS.limited });
    }
    return avail;
};

const DOCTORS_DATA = [
    {
        fullName: "Dr. Rahul Mehta",
        email: "rahul.mehta@pluscare.com",
        phone: "+91 98765 43210",
        specialization: "Cardiologist",
        department: "Cardiology",
        address: "Mumbai Cardiac Centre, Bandra West",
        category: "Cardiology",
        qualification: "MD (Cardiology), DM – AIIMS Delhi",
        location: "Mumbai Cardiac Centre, Bandra West, Mumbai",
        consultationFee: 1200,
        experienceYears: 14,
        rating: 4.9,
        numReviews: 38,
        skills: [
            "Coronary Angiography",
            "Echocardiogram",
            "Cardiac Catheterization",
            "Arrhythmia Management",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Priya Shah",
        email: "priya.shah@pluscare.com",
        phone: "+91 98765 11223",
        specialization: "Dentist",
        department: "Dental Care",
        address: "Ahmedabad Smile Clinic, C.G. Road",
        category: "Dental Care",
        qualification: "BDS, MDS (Oral Surgery) – SDM Dharwad",
        location: "Ahmedabad Smile Clinic, C.G. Road, Ahmedabad",
        consultationFee: 700,
        experienceYears: 9,
        rating: 4.8,
        numReviews: 52,
        skills: [
            "Root Canal Treatment",
            "Cosmetic Dentistry",
            "Orthodontics",
            "Dental Implants",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Amit Patel",
        email: "amit.patel@pluscare.com",
        phone: "+91 98765 22334",
        specialization: "Dermatologist",
        department: "Skin Care",
        address: "Pune Derm & Aesthetic Clinic, Koregaon Park",
        category: "Skin Care",
        qualification: "MD (Dermatology) – KEM Hospital Pune",
        location: "Pune Derm & Aesthetic Clinic, Koregaon Park, Pune",
        consultationFee: 900,
        experienceYears: 11,
        rating: 4.85,
        numReviews: 44,
        skills: [
            "Acne & Scar Treatment",
            "Dermoscopy",
            "Laser Skin Therapy",
            "Mole Mapping",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Sunita Rao",
        email: "sunita.rao@pluscare.com",
        phone: "+91 98765 33445",
        specialization: "Ophthalmologist",
        department: "Eye Care",
        address: "Hyderabad Eye & Vision Institute, Jubilee Hills",
        category: "Eye Care",
        qualification: "MS (Ophthalmology) – LV Prasad Eye Institute",
        location: "Hyderabad Eye & Vision Institute, Jubilee Hills, Hyderabad",
        consultationFee: 800,
        experienceYears: 12,
        rating: 4.9,
        numReviews: 61,
        skills: [
            "LASIK Evaluation",
            "Glaucoma Management",
            "Cataract Surgery",
            "Retinal Screening",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Vikram Singh",
        email: "vikram.singh@pluscare.com",
        phone: "+91 98765 44556",
        specialization: "Physiotherapist",
        department: "Physiotherapy",
        address: "Delhi Sports Physio & Rehab, Vasant Vihar",
        category: "Physiotherapy",
        qualification: "BPT, MPT (Musculoskeletal) – NIMHANS Bangalore",
        location: "Delhi Sports Physio & Rehab, Vasant Vihar, New Delhi",
        consultationFee: 600,
        experienceYears: 8,
        rating: 4.75,
        numReviews: 33,
        skills: [
            "Spinal Rehabilitation",
            "Post-Op Recovery",
            "Sports Injury Management",
            "Dry Needling",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Meera Nair",
        email: "meera.nair@pluscare.com",
        phone: "+91 98765 55667",
        specialization: "Psychologist & Psychiatrist",
        department: "Mental Health",
        address: "Kochi Mind & Wellness Centre, Marine Drive",
        category: "Mental Health",
        qualification: "MD (Psychiatry) – NIMHANS Bangalore",
        location: "Kochi Mind & Wellness Centre, Marine Drive, Kochi",
        consultationFee: 1000,
        experienceYears: 10,
        rating: 4.95,
        numReviews: 72,
        skills: [
            "Cognitive Behavioral Therapy",
            "Anxiety & Depression Management",
            "Child & Adolescent Psychiatry",
            "Stress Counseling",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Arjun Sharma",
        email: "arjun.sharma@pluscare.com",
        phone: "+91 98765 66778",
        specialization: "Orthopedic Specialist",
        department: "Orthopedic Care",
        address: "Jaipur Bone & Joint Hospital, Civil Lines",
        category: "Orthopedic Care",
        qualification: "MS (Orthopedics) – SMS Medical College Jaipur",
        location: "Jaipur Bone & Joint Hospital, Civil Lines, Jaipur",
        consultationFee: 1100,
        experienceYears: 16,
        rating: 4.87,
        numReviews: 48,
        skills: [
            "Knee & Hip Arthroplasty",
            "Arthroscopy",
            "Fracture Management",
            "Spine Surgery",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    },
    {
        fullName: "Dr. Kavita Gupta",
        email: "kavita.gupta@pluscare.com",
        phone: "+91 98765 77889",
        specialization: "General Physician",
        department: "General Consultation",
        address: "Bangalore City Health Clinic, Indiranagar",
        category: "General Consultation",
        qualification: "MBBS, MD (Internal Medicine) – Manipal University",
        location: "Bangalore City Health Clinic, Indiranagar, Bengaluru",
        consultationFee: 500,
        experienceYears: 13,
        rating: 4.8,
        numReviews: 89,
        skills: [
            "General Medicine",
            "Fever & Infection Management",
            "Chronic Disease Care",
            "Preventive Health Screening",
        ],
        profileImage:
            "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300",
    },
];

const SERVICES_DATA = [
    {
        name: "Advanced Cardiac Consultation & ECG",
        category: "Cardiology",
        description:
            "Comprehensive 12-lead ECG evaluation, rhythm analysis, and specialist consultation for high-precision cardiovascular diagnostics by a certified Cardiologist.",
        price: 1200,
        duration: 45,
        rating: 4.9,
        numReviews: 18,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "Complete Dental Check-up & Cleaning",
        category: "Dental Care",
        description:
            "Full oral examination, professional scaling, X-ray evaluation, and personalised treatment plan by a qualified Dentist.",
        price: 700,
        duration: 40,
        rating: 4.8,
        numReviews: 24,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1588776814546-1ffbb172b786?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "Clinical Skin Analysis & Dermatology Consult",
        category: "Skin Care",
        description:
            "Dermoscopic examination of skin conditions, acne treatment protocols, mole mapping, and personalised skincare regimen by a certified Dermatologist.",
        price: 900,
        duration: 35,
        rating: 4.85,
        numReviews: 14,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1512290900673-700200885e33?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "Eye Examination & Vision Assessment",
        category: "Eye Care",
        description:
            "Comprehensive vision screening, intraocular pressure measurement, retinal imaging, and LASIK eligibility evaluation by an Ophthalmologist.",
        price: 800,
        duration: 30,
        rating: 4.9,
        numReviews: 31,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1516327576673-a4e3571d6e31?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "Physiotherapy Session & Spinal Rehabilitation",
        category: "Physiotherapy",
        description:
            "Personalised musculoskeletal therapy, spinal alignment exercises, and post-operative joint rehabilitation by a certified Physiotherapist.",
        price: 600,
        duration: 60,
        rating: 4.75,
        numReviews: 19,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "Mental Health & Psychiatric Consultation",
        category: "Mental Health",
        description:
            "Private, confidential psychiatric evaluation, anxiety and depression management, and personalised therapeutic plan by a qualified Psychologist/Psychiatrist.",
        price: 1000,
        duration: 50,
        rating: 4.95,
        numReviews: 40,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "Orthopedic Consultation & Joint Assessment",
        category: "Orthopedic Care",
        description:
            "Expert evaluation of bone, joint and muscle conditions, fracture management, and surgical planning by an Orthopedic Specialist.",
        price: 1100,
        duration: 40,
        rating: 4.87,
        numReviews: 25,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&q=80&w=600",
    },
    {
        name: "General Health Consultation & Checkup",
        category: "General Consultation",
        description:
            "Routine health assessment, fever and infection management, chronic disease follow-up, and preventive health screening by a General Physician.",
        price: 500,
        duration: 30,
        rating: 4.8,
        numReviews: 55,
        isAvailable: true,
        image:
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
    },
];

const seedDoctors = async () => {
    try {
        await connectDB();
        console.log("🌱 Starting category-mapped doctor seeding...\n");

        const createdUsers = [];
        const createdProviders = [];

        for (const doctorData of DOCTORS_DATA) {
            // 1. Upsert User
            let user = await User.findOne({ email: doctorData.email });
            if (!user) {
                user = await User.create({
                    fullName: doctorData.fullName,
                    email: doctorData.email,
                    phone: doctorData.phone,
                    password: "Doctor@123",
                    role: "Doctor",
                    specialization: doctorData.specialization,
                    department: doctorData.department,
                    address: doctorData.address,
                });
                console.log(`✅ Created User: ${doctorData.fullName}`);
            } else {
                // Update existing user fields
                user.specialization = doctorData.specialization;
                user.department = doctorData.department;
                user.address = doctorData.address;
                await user.save();
                console.log(`🔄 Updated User: ${doctorData.fullName}`);
            }
            createdUsers.push(user);

            // 2. Upsert Provider profile
            let provider = await Provider.findOne({ user: user._id });
            const availabilitySlots = buildWeeklyAvailability();

            if (!provider) {
                provider = await Provider.create({
                    user: user._id,
                    category: doctorData.category,
                    specialization: doctorData.specialization,
                    qualification: doctorData.qualification,
                    profileImage: doctorData.profileImage,
                    location: doctorData.location,
                    consultationFee: doctorData.consultationFee,
                    skills: doctorData.skills,
                    experienceYears: doctorData.experienceYears,
                    rating: doctorData.rating,
                    numReviews: doctorData.numReviews,
                    availability: availabilitySlots,
                    isAvailable: true,
                    services: [],
                });
                console.log(
                    `✅ Created Provider Profile: ${doctorData.specialization} (${doctorData.category})`
                );
            } else {
                // Update provider with new fields
                provider.category = doctorData.category;
                provider.specialization = doctorData.specialization;
                provider.qualification = doctorData.qualification;
                provider.profileImage = doctorData.profileImage;
                provider.location = doctorData.location;
                provider.consultationFee = doctorData.consultationFee;
                provider.skills = doctorData.skills;
                provider.experienceYears = doctorData.experienceYears;
                provider.rating = doctorData.rating;
                provider.numReviews = doctorData.numReviews;
                provider.isAvailable = true;
                if (!provider.availability || provider.availability.length === 0) {
                    provider.availability = availabilitySlots;
                }
                await provider.save();
                console.log(
                    `🔄 Updated Provider Profile: ${doctorData.specialization} (${doctorData.category})`
                );
            }
            createdProviders.push({ user, provider });
        }

        console.log("\n📦 Seeding Services...\n");

        for (const serviceData of SERVICES_DATA) {
            // Find matching doctor for this category
            const match = createdProviders.find(
                (cp) =>
                    cp.provider.category.toLowerCase() ===
                    serviceData.category.toLowerCase()
            );

            const providerUserRef = match ? [match.user._id] : [];

            // Check if a service for this category already exists
            let service = await Service.findOne({
                category: serviceData.category,
                name: serviceData.name,
            });

            if (!service) {
                service = await Service.create({
                    ...serviceData,
                    providers: providerUserRef,
                });
                console.log(`✅ Created Service: ${serviceData.name} [${serviceData.category}]`);
            } else {
                // Update providers reference
                service.providers = providerUserRef;
                await service.save();
                console.log(`🔄 Updated Service: ${serviceData.name} [${serviceData.category}]`);
            }

            // Link service to the matching provider's services array
            if (match) {
                const { provider } = match;
                const serviceIdStr = service._id.toString();
                const alreadyLinked = provider.services.some(
                    (s) => s.toString() === serviceIdStr
                );
                if (!alreadyLinked) {
                    provider.services.push(service._id);
                    await provider.save();
                }
            }
        }

        console.log("\n🎉 Doctor & Service seeding completed successfully!");
        console.log("━".repeat(60));
        console.log(`👨‍⚕️  ${DOCTORS_DATA.length} doctors seeded across ${DOCTORS_DATA.length} categories`);
        console.log(`🏥  ${SERVICES_DATA.length} services seeded`);
        console.log("━".repeat(60));
        console.log("\nCategory → Doctor mapping:");
        DOCTORS_DATA.forEach((d) => {
            console.log(`  ${d.category.padEnd(22)} → ${d.specialization} (${d.fullName})`);
        });
        console.log("");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDoctors();
