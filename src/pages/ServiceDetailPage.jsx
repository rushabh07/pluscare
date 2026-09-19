import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FiArrowLeft, FiClock, FiStar, FiMapPin, FiUser,
    FiAlertCircle, FiAward, FiBriefcase, FiPhone,
    FiMail, FiDollarSign, FiCheckCircle, FiCalendar,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceDetailsModal from "../components/ServiceDetailsModal";
import { serviceApi } from "../services/api";

export default function ServiceDetailPage() {
    const { serviceId } = useParams();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(true);

    // Load service summary for the page background
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!serviceId) return;
        serviceApi
            .getServiceById(serviceId)
            .then((res) => {
                setService(res.data?.service || null);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Service not found.");
            })
            .finally(() => setLoading(false));
    }, [serviceId]);

    const handleClose = () => {
        // When the modal is closed, go back to services list
        navigate("/services");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Background page — shows while modal is open */}
            <div className="pt-24 pb-10 flex-1">
                {/* Back breadcrumb */}
                <div className="max-w-7xl mx-auto px-5 mb-6">
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <FiArrowLeft />
                        Back to All Services
                    </Link>
                </div>

                {loading ? (
                    <div className="max-w-7xl mx-auto px-5 py-20 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium text-sm">Loading service details...</p>
                    </div>
                ) : error ? (
                    <div className="max-w-7xl mx-auto px-5">
                        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-800">
                            <FiAlertCircle className="text-4xl mx-auto mb-2 text-red-500" />
                            <p className="font-bold">{error}</p>
                            <Link
                                to="/services"
                                className="mt-4 inline-block px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm"
                            >
                                Browse All Services
                            </Link>
                        </div>
                    </div>
                ) : service ? (
                    <div className="max-w-7xl mx-auto px-5">
                        {/* Hero banner shown behind the modal */}
                        <div className="relative rounded-3xl overflow-hidden h-56 md:h-72 bg-slate-900 shadow-2xl">
                            <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 space-y-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-600/80 px-4 py-1.5 rounded-full">
                                    {service.category}
                                </span>
                                <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                                    {service.name}
                                </h1>
                                <div className="flex items-center gap-4 text-sm font-semibold text-white/80">
                                    <span className="flex items-center gap-1">
                                        <FiClock /> {service.duration} mins
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiStar className="text-amber-400 fill-amber-400" />
                                        {service.rating || "5.0"}
                                    </span>
                                    <span className="text-blue-300 font-extrabold text-lg">₹{service.price}</span>
                                </div>
                                <p className="text-white/60 text-xs max-w-xl">
                                    Opening booking flow... Select a doctor and schedule your appointment.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <Footer />

            {/* Booking modal — opens automatically */}
            {serviceId && showModal && (
                <ServiceDetailsModal
                    serviceId={serviceId}
                    onClose={handleClose}
                    onBookingSuccess={() => {
                        // Keep modal open to show confirmation
                    }}
                />
            )}
        </div>
    );
}
