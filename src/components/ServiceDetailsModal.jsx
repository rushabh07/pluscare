import React, { useState, useEffect, useCallback } from "react";
import {
    FiX, FiClock, FiStar, FiCalendar, FiMapPin,
    FiCheckCircle, FiAlertCircle, FiArrowRight, FiCheck,
    FiUser, FiPhone, FiMail, FiAward, FiBriefcase,
    FiShield, FiChevronRight, FiDollarSign,
} from "react-icons/fi";
import { serviceApi, serviceBookingApi, providerApi } from "../services/api";
import { getDoctorInitial } from "../utils/doctorUtils";

/* ────────────────────────────────────────────────────────────
   Doctor Profile Overlay (View Profile modal)
──────────────────────────────────────────────────────────── */
function DoctorProfileOverlay({ provider, onClose, onBookNow }) {
    const name = provider?.user?.fullName || "Specialist";
    const initial = getDoctorInitial(name);

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient header */}
                <div className="bg-gradient-to-br from-blue-700 to-teal-600 pt-8 pb-14 px-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                    >
                        <FiX />
                    </button>
                    {/* Avatar */}
                    {provider?.profileImage ? (
                        <img
                            src={provider.profileImage}
                            alt={name}
                            className="w-24 h-24 rounded-full border-4 border-white/60 object-cover mx-auto mb-3 shadow-xl"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />
                    ) : null}
                    <div
                        className="w-24 h-24 rounded-full border-4 border-white/60 bg-white/20 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3 shadow-xl"
                        style={{ display: provider?.profileImage ? "none" : "flex" }}
                    >
                        {initial}
                    </div>
                    <h3 className="text-xl font-extrabold">{name}</h3>
                    <p className="text-blue-100 text-sm mt-1">
                        {provider?.specialization || provider?.user?.specialization || "Specialist"}
                    </p>
                    <span className="inline-block mt-2 text-xs bg-white/20 border border-white/30 px-3 py-1 rounded-full">
                        {provider?.category || "Healthcare"}
                    </span>
                </div>

                {/* Stats row */}
                <div className="mx-6 -mt-8 bg-white rounded-2xl shadow-lg border border-slate-100 grid grid-cols-3 text-center py-4 px-2 gap-2">
                    <div>
                        <div className="text-lg font-extrabold text-amber-500">★ {provider?.rating || "5.0"}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Rating</div>
                    </div>
                    <div>
                        <div className="text-lg font-extrabold text-blue-600">{provider?.experienceYears || 1}yr</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Experience</div>
                    </div>
                    <div>
                        <div className="text-lg font-extrabold text-emerald-600">{provider?.numReviews || 0}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Reviews</div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3 text-sm">
                    <InfoRow icon={<FiAward />} label="Qualification" value={provider?.qualification || "MBBS"} />
                    <InfoRow icon={<FiBriefcase />} label="Specialization" value={provider?.specialization || "—"} />
                    <InfoRow icon={<FiMapPin />} label="Location" value={provider?.location || provider?.user?.address || "—"} />
                    <InfoRow icon={<FiMail />} label="Email" value={provider?.user?.email || "—"} />
                    <InfoRow icon={<FiPhone />} label="Phone" value={provider?.user?.phone || "—"} />
                    <InfoRow
                        icon={<FiDollarSign />}
                        label="Consultation Fee"
                        value={`₹${provider?.consultationFee || "—"}`}
                        highlight
                    />

                    {provider?.skills && provider.skills.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Skills & Expertise</p>
                            <div className="flex flex-wrap gap-1.5">
                                {provider.skills.map((skill, i) => (
                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={onBookNow}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        Book This Doctor <FiChevronRight className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, highlight }) {
    return (
        <div className="flex items-start gap-3">
            <span className={`mt-0.5 ${highlight ? "text-emerald-600" : "text-blue-500"}`}>{icon}</span>
            <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{label}</span>
                <span className={`text-xs font-semibold ${highlight ? "text-emerald-700" : "text-slate-800"}`}>{value}</span>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Doctor Card Component
──────────────────────────────────────────────────────────── */
function DoctorCard({ provider, isSelected, onSelect, onViewProfile }) {
    const name = provider?.user?.fullName || "Specialist";
    const initial = getDoctorInitial(name);
    const isAvailable = provider?.isAvailable !== false;

    const [imgError, setImgError] = useState(false);

    return (
        <div
            onClick={() => { if (isAvailable) onSelect(provider); }}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer
                ${isSelected
                    ? "border-blue-600 bg-blue-50/70 shadow-lg ring-2 ring-blue-500/20"
                    : isAvailable
                    ? "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                    : "border-slate-100 bg-slate-50/80 opacity-55 cursor-not-allowed"
                }`}
        >
            {/* Selected checkmark */}
            {isSelected && (
                <div className="absolute top-3 right-3 text-blue-600 z-10">
                    <FiCheckCircle className="text-xl" />
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                    {provider?.profileImage && !imgError ? (
                        <img
                            src={provider.profileImage}
                            alt={name}
                            onError={() => setImgError(true)}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                    ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-teal-500 text-white rounded-xl flex items-center justify-center font-extrabold text-xl shadow-sm">
                            {initial}
                        </div>
                    )}
                    {/* Availability dot */}
                    <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isAvailable ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                    />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate leading-tight">{name}</h4>
                        <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                isAvailable
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-500"
                            }`}
                        >
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                    </div>

                    <p className="text-xs text-blue-600 font-semibold mt-0.5 truncate">
                        {provider?.specialization || provider?.user?.specialization || "Specialist"}
                    </p>

                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {provider?.qualification || "MBBS"}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-600 font-semibold">
                        <span className="flex items-center gap-1">
                            <FiStar className="text-amber-400 fill-amber-400" />
                            {provider?.rating || "5.0"}
                            <span className="text-slate-400 font-normal">({provider?.numReviews || 0})</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <FiBriefcase className="text-slate-400" />
                            {provider?.experienceYears || 1} yrs exp
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <FiDollarSign className="text-emerald-500" />
                            ₹{provider?.consultationFee || "—"}
                        </span>
                    </div>

                    {provider?.location && (
                        <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5 truncate">
                            <FiMapPin className="flex-shrink-0" />
                            {provider.location}
                        </p>
                    )}

                    {/* Actions */}
                    <div
                        className="flex gap-2 mt-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => onViewProfile(provider)}
                            className="flex-1 py-1.5 text-[10px] font-bold border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                            View Profile
                        </button>
                        <button
                            disabled={!isAvailable}
                            onClick={() => { if (isAvailable) onSelect(provider); }}
                            className="flex-1 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Main Modal
──────────────────────────────────────────────────────────── */
export default function ServiceDetailsModal({ serviceId, onClose, onBookingSuccess }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providersLoading, setProvidersLoading] = useState(false);

    // Booking flow state
    const [step, setStep] = useState(1); // 1: Details & Provider | 2: Date & Time | 3: Address | 4: Confirmed
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    // Receipt flow state
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState("");
    const [showReceipt, setShowReceipt] = useState(false);

    // Profile overlay
    const [profileProvider, setProfileProvider] = useState(null);

    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

    // ── Load service details ──
    useEffect(() => {
        if (!serviceId) return;
        setLoading(true);
        setError("");
        serviceApi
            .getServiceById(serviceId)
            .then((res) => {
                setData(res.data);
                if (user?.address) setAddress(user.address);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Failed to load service details.");
            })
            .finally(() => setLoading(false));
    }, [serviceId]);

    // ── Load providers by category ──
    useEffect(() => {
        if (!data?.service?.category) return;
        setProvidersLoading(true);

        providerApi
            .getProvidersByCategory(data.service.category)
            .then((res) => {
                const list = res.data || [];
                setProviders(list);
                // Also merge any providers from getServiceById that may not have category set
                const merged = [...list];
                if (data.providerProfiles) {
                    data.providerProfiles.forEach((p) => {
                        const alreadyIn = merged.some((m) => m._id === p._id);
                        if (!alreadyIn) merged.push(p);
                    });
                }
                setProviders(merged);
                // Auto-select first available
                const firstAvail = merged.find((p) => p.isAvailable !== false);
                if (firstAvail) setSelectedProvider(firstAvail);
            })
            .catch(() => {
                // Fallback to providerProfiles from service detail
                if (data?.providerProfiles?.length > 0) {
                    setProviders(data.providerProfiles);
                    const firstAvail = data.providerProfiles.find((p) => p.isAvailable !== false);
                    if (firstAvail) setSelectedProvider(firstAvail);
                }
            })
            .finally(() => setProvidersLoading(false));
    }, [data?.service?.category]);

    // ── Load slots when provider + date changes ──
    useEffect(() => {
        if (!selectedProvider || !bookingDate) {
            setAvailableSlots([]);
            return;
        }
        setSlotsLoading(true);
        setSelectedSlot("");
        const providerId = selectedProvider._id;

        providerApi
            .getProviderAvailability(providerId, bookingDate)
            .then((res) => {
                setAvailableSlots(res.data?.slots || ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]);
            })
            .catch(() => {
                // Fallback: parse from provider.availability
                if (selectedProvider.availability) {
                    const dateObj = new Date(bookingDate);
                    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const dayName = dayNames[dateObj.getDay()];
                    const dayAvail = selectedProvider.availability.find((a) => a.day === dayName);
                    setAvailableSlots(dayAvail?.slots || ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]);
                }
            })
            .finally(() => setSlotsLoading(false));
    }, [selectedProvider, bookingDate]);

    // ── Booking Submit ──
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingError("");

        if (!user?.token) {
            setBookingError("Please login to complete your booking.");
            return;
        }
        if (!selectedProvider) {
            setBookingError("Please select a doctor/provider.");
            return;
        }
        if (!bookingDate) {
            setBookingError("Please select a date.");
            return;
        }
        if (!selectedSlot) {
            setBookingError("Please select a time slot.");
            return;
        }
        if (!address.trim()) {
            setBookingError("Please provide your service address.");
            return;
        }

        setSubmitting(true);
        try {
            const providerUserId =
                selectedProvider.user?._id || selectedProvider.user || selectedProvider._id;

            const res = await serviceBookingApi.createBooking({
                serviceId: data.service._id,
                providerId: providerUserId,
                bookingDate,
                timeSlot: selectedSlot,
                address,
                notes,
            });

            setConfirmedBooking(res.data);
            setStep(4);
            if (onBookingSuccess) onBookingSuccess(res.data);
        } catch (err) {
            setBookingError(
                err.response?.data?.message || "Failed to submit booking. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Receipt actions ──
    const handleResendReceipt = async () => {
        if (!confirmedBooking) return;
        setResending(true);
        setResendStatus("");
        try {
            await serviceBookingApi.sendReceipt(confirmedBooking._id);
            setResendStatus("Receipt resent to your email.");
        } catch (err) {
            setResendStatus("Failed to resend receipt.");
        } finally {
            setResending(false);
        }
    };

    const handleDownloadReceipt = () => {
        window.print();
    };

    if (!serviceId) return null;

    const todayStr = new Date().toISOString().split("T")[0];
    const selectedProviderName =
        selectedProvider?.user?.fullName || "Assigned Specialist";

    return (
        <>
            {/* Profile overlay (outside main modal z-stack) */}
            {profileProvider && (
                <DoctorProfileOverlay
                    provider={profileProvider}
                    onClose={() => setProfileProvider(null)}
                    onBookNow={() => {
                        setSelectedProvider(profileProvider);
                        setProfileProvider(null);
                        setStep(2);
                    }}
                />
            )}

            {/* Main Modal Backdrop */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
                <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col my-6" style={{ maxHeight: "92vh" }}>

                    {/* ── Header ── */}
                    <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between rounded-t-3xl">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/50">
                                Service Details & Booking
                            </span>
                            {data?.service && (
                                <span className="hidden sm:block text-sm font-bold text-white/80 truncate max-w-xs">
                                    {data.service.name}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                        >
                            <FiX className="text-xl" />
                        </button>
                    </div>

                    {/* ── Content ── */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-7">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-500 font-medium text-sm">Loading service from MongoDB...</p>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center text-red-800 bg-red-50 rounded-2xl p-6 border border-red-100">
                                <FiAlertCircle className="text-4xl mx-auto mb-2 text-red-500" />
                                <p className="font-bold">{error}</p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        ) : data ? (
                            <>
                                {/* ── Step Progress Bar ── */}
                                {step < 4 && (
                                    <div className="mb-7 flex items-center gap-2">
                                        {[
                                            { n: 1, label: "Details & Doctor" },
                                            { n: 2, label: "Date & Slot" },
                                            { n: 3, label: "Address & Confirm" },
                                        ].map(({ n, label }, idx) => (
                                            <React.Fragment key={n}>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
                                                            step > n
                                                                ? "bg-emerald-500 text-white"
                                                                : step === n
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-slate-200 text-slate-500"
                                                        }`}
                                                    >
                                                        {step > n ? <FiCheck /> : n}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-bold hidden sm:block ${
                                                            step >= n ? "text-blue-700" : "text-slate-400"
                                                        }`}
                                                    >
                                                        {label}
                                                    </span>
                                                </div>
                                                {idx < 2 && (
                                                    <div
                                                        className={`flex-1 h-0.5 transition-colors ${
                                                            step > n ? "bg-emerald-400" : "bg-slate-200"
                                                        }`}
                                                    />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}

                                {/* Error banner */}
                                {bookingError && (
                                    <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
                                        <FiAlertCircle className="text-xl flex-shrink-0" />
                                        <span>{bookingError}</span>
                                    </div>
                                )}

                                {/* ═══════════ STEP 1: Service Details + Doctor Selection ═══════════ */}
                                {step === 1 && (
                                    <div className="space-y-7">
                                        {/* Service hero */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                                            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                                <img
                                                    src={data.service.image}
                                                    alt={data.service.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                                            </div>
                                            <div className="md:col-span-2 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="bg-blue-50 text-blue-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                                        {data.service.category}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                                        <FiStar className="fill-amber-400" />
                                                        {data.service.rating || "5.0"} ({data.service.numReviews || 0} reviews)
                                                    </span>
                                                    {data.service.isAvailable ? (
                                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                                                            ✓ Available
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
                                                            Unavailable
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                                                    {data.service.name}
                                                </h2>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    {data.service.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-100 text-sm font-semibold text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <FiClock className="text-blue-600" />
                                                        <span>Duration: <strong>{data.service.duration} mins</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xl font-extrabold text-blue-600">
                                                        <span>₹{data.service.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Doctor / Provider Selection */}
                                        <div className="space-y-4 pt-5 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                                    <FiUser className="text-blue-600" />
                                                    Select Doctor / Provider
                                                </h3>
                                                {providersLoading ? (
                                                    <span className="text-xs text-blue-500 font-semibold flex items-center gap-1.5">
                                                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        Loading...
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-slate-500">
                                                        {providers.filter(p => p.isAvailable !== false).length} Available
                                                    </span>
                                                )}
                                            </div>

                                            {providers.length === 0 && !providersLoading ? (
                                                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 flex items-center gap-3">
                                                    <FiAlertCircle className="text-xl flex-shrink-0" />
                                                    <span>
                                                        No providers registered for <strong>{data.service.category}</strong> yet.
                                                        A specialist will be assigned upon booking confirmation.
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {providers.map((prov) => (
                                                        <DoctorCard
                                                            key={prov._id}
                                                            provider={prov}
                                                            isSelected={selectedProvider?._id === prov._id}
                                                            onSelect={(p) => {
                                                                setSelectedProvider(p);
                                                                setBookingError("");
                                                            }}
                                                            onViewProfile={(p) => setProfileProvider(p)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Reviews */}
                                        {data.reviews?.length > 0 && (
                                            <div className="space-y-3 pt-5 border-t border-slate-100">
                                                <h3 className="text-base font-extrabold text-slate-900">
                                                    Verified Reviews ({data.reviews.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {data.reviews.slice(0, 3).map((rev) => (
                                                        <div key={rev._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-slate-800">{rev.user?.fullName || "Patient"}</span>
                                                                <span className="text-amber-500 font-bold">★ {rev.rating}/5</span>
                                                            </div>
                                                            <p className="text-slate-600">{rev.comment}</p>
                                                            <span className="text-[10px] text-slate-400 block">
                                                                {new Date(rev.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 1 CTA */}
                                        <div className="flex justify-end pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    if (!selectedProvider && providers.length > 0) {
                                                        setBookingError("Please select a doctor/provider to continue.");
                                                        return;
                                                    }
                                                    setBookingError("");
                                                    setStep(2);
                                                }}
                                                className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
                                            >
                                                Select Date & Slot <FiArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ═══════════ STEP 2: Date & Time Slot ═══════════ */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        {/* Selected provider banner */}
                                        {selectedProvider && (
                                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {getDoctorInitial(selectedProviderName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-extrabold text-blue-700 uppercase">Selected Provider</p>
                                                    <p className="font-bold text-slate-900 text-sm truncate">{selectedProviderName}</p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {selectedProvider?.specialization || selectedProvider?.user?.specialization || "Specialist"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="text-xs text-blue-600 font-bold underline cursor-pointer flex-shrink-0"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        )}

                                        {/* Date picker */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <FiCalendar className="text-blue-600" />
                                                Select Booking Date
                                            </label>
                                            <input
                                                type="date"
                                                min={todayStr}
                                                value={bookingDate}
                                                onChange={(e) => {
                                                    setBookingDate(e.target.value);
                                                    setSelectedSlot("");
                                                }}
                                                className="w-full sm:w-72 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
                                            />
                                        </div>

                                        {/* Time slots */}
                                        {bookingDate && (
                                            <div className="space-y-3 pt-2">
                                                <label className="block text-sm font-bold text-slate-900">
                                                    Select Available Time Slot
                                                </label>
                                                {slotsLoading ? (
                                                    <div className="flex items-center gap-2 text-sm text-blue-500 font-semibold">
                                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        Fetching available slots...
                                                    </div>
                                                ) : availableSlots.length === 0 ? (
                                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                                        No slots available for this date. Please choose another date.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {availableSlots.map((slot) => (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`py-3 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                                                                    selectedSlot === slot
                                                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                                                                }`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                                            <button
                                                onClick={() => { setBookingError(""); setStep(1); }}
                                                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold cursor-pointer"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!bookingDate || !selectedSlot) {
                                                        setBookingError("Please select both a date and a time slot.");
                                                        return;
                                                    }
                                                    setBookingError("");
                                                    setStep(3);
                                                }}
                                                className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                                            >
                                                Enter Address <FiArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ═══════════ STEP 3: Address + Summary + Confirm ═══════════ */}
                                {step === 3 && (
                                    <form onSubmit={handleBookingSubmit} className="space-y-5">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                                    <FiMapPin className="inline mr-1 text-blue-600" />
                                                    Service Delivery Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Full address — house/flat no., street, city, state, PIN"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                                    Special Instructions / Notes (Optional)
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Any relevant symptoms, medical history, or access instructions..."
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Booking Summary Card */}
                                        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-xl border border-slate-800">
                                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 border-b border-slate-800 pb-2">
                                                Booking Summary
                                            </h4>
                                            <SummaryRow label="Service" value={data.service.name} />
                                            <SummaryRow
                                                label="Category"
                                                value={data.service.category}
                                            />
                                            <SummaryRow
                                                label="Doctor / Provider"
                                                value={selectedProviderName}
                                            />
                                            <SummaryRow
                                                label="Specialization"
                                                value={
                                                    selectedProvider?.specialization ||
                                                    selectedProvider?.user?.specialization ||
                                                    "Specialist"
                                                }
                                            />
                                            <SummaryRow label="Date" value={new Date(bookingDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
                                            <SummaryRow label="Time Slot" value={selectedSlot} highlight />
                                            <SummaryRow label="Address" value={address} />
                                            <div className="flex justify-between text-base font-extrabold pt-2 border-t border-slate-800">
                                                <span className="text-slate-300">Total Service Price</span>
                                                <span className="text-xl text-emerald-400">₹{data.service.price}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Initial Status</span>
                                                <span className="text-amber-400 font-bold">Pending</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => { setBookingError(""); setStep(2); }}
                                                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold cursor-pointer"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Saving Booking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiShield className="text-lg" />
                                                        Confirm & Save Booking
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* ═══════════ STEP 4: Booking Confirmed ═══════════ */}
                                {step === 4 && confirmedBooking && !showReceipt && (
                                    <div className="py-6 text-center space-y-6">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce">
                                            ✓
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-slate-900">Booking Confirmed!</h3>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Your booking has been saved in MongoDB with status{" "}
                                                <span className="font-bold text-amber-600">Pending</span>.
                                            </p>
                                        </div>

                                        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-2.5">
                                            <ConfirmRow label="Booking ID" value={confirmedBooking._id} mono />
                                            <ConfirmRow
                                                label="Service"
                                                value={confirmedBooking.service?.name || data.service.name}
                                            />
                                            <ConfirmRow
                                                label="Doctor / Provider"
                                                value={confirmedBooking.provider?.fullName || selectedProviderName}
                                            />
                                            <ConfirmRow
                                                label="Date"
                                                value={new Date(confirmedBooking.bookingDate).toLocaleDateString("en-IN", {
                                                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                                                })}
                                            />
                                            <ConfirmRow label="Time" value={confirmedBooking.timeSlot} />
                                            <ConfirmRow label="Price" value={`₹${confirmedBooking.totalPrice}`} />
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Email Status</span>
                                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${confirmedBooking.emailDeliveryStatus === 'Success' ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-rose-800 bg-rose-50 border-rose-200'}`}>
                                                    {confirmedBooking.emailDeliveryStatus || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="max-w-md mx-auto flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowReceipt(true)}
                                                    className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 rounded-xl text-xs transition-colors cursor-pointer"
                                                >
                                                    View Receipt
                                                </button>
                                                <button
                                                    onClick={handleDownloadReceipt}
                                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                                                >
                                                    Download Receipt
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleResendReceipt}
                                                disabled={resending}
                                                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                {resending ? "Resending..." : "Resend Receipt"}
                                            </button>
                                            {resendStatus && (
                                                <div className={`text-xs p-2 rounded-lg ${resendStatus.includes("Failed") ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
                                                    {resendStatus}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                            You can view and manage this booking in your{" "}
                                            <a href="/patient" className="text-blue-600 font-bold underline">
                                                Patient Dashboard
                                            </a>
                                            .
                                        </p>

                                        <button
                                            onClick={onClose}
                                            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-lg cursor-pointer transition-colors"
                                        >
                                            Close Window
                                        </button>
                                    </div>
                                )}

                                {/* ═══════════ RECEIPT VIEW ═══════════ */}
                                {showReceipt && confirmedBooking && (
                                    <div className="py-6 px-2 space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                            <h3 className="text-xl font-extrabold text-slate-900">Booking Receipt</h3>
                                            <div className="flex gap-2">
                                                <button onClick={handleDownloadReceipt} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                                                    Print
                                                </button>
                                                <button onClick={() => setShowReceipt(false)} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div id="receipt-print-area" className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl">
                                            <div className="text-center mb-8">
                                                <h2 className="text-2xl font-extrabold text-blue-900">PlusCare Health</h2>
                                                <p className="text-sm text-slate-500">Official Booking Receipt</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                                                <div>
                                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Billed To</p>
                                                    <p className="font-bold text-slate-800">{confirmedBooking.user?.fullName || user.name || "Patient"}</p>
                                                    <p className="text-slate-600">{confirmedBooking.user?.email || user.email || ""}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Receipt Details</p>
                                                    <p className="font-bold text-slate-800">ID: <span className="font-mono font-normal">{confirmedBooking._id}</span></p>
                                                    <p className="text-slate-600">Date: {new Date(confirmedBooking.createdAt || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                        <tr>
                                                            <th className="px-4 py-3 font-bold text-slate-700">Description</th>
                                                            <th className="px-4 py-3 font-bold text-slate-700 text-right">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        <tr>
                                                            <td className="px-4 py-4">
                                                                <p className="font-bold text-slate-800">{confirmedBooking.service?.name || data.service.name}</p>
                                                                <p className="text-xs text-slate-500 mt-1">Provider: {confirmedBooking.provider?.fullName || selectedProviderName}</p>
                                                                <p className="text-xs text-slate-500">Schedule: {new Date(confirmedBooking.bookingDate).toLocaleDateString()} at {confirmedBooking.timeSlot}</p>
                                                            </td>
                                                            <td className="px-4 py-4 text-right font-bold text-slate-800">
                                                                ₹{confirmedBooking.totalPrice}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100">
                                                <span className="font-bold uppercase text-xs">Total Paid / Payable</span>
                                                <span className="text-2xl font-extrabold">₹{confirmedBooking.totalPrice}</span>
                                            </div>
                                            
                                            <div className="mt-8 text-center text-xs text-slate-400">
                                                <p>This is a computer-generated receipt and requires no signature.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ── Small helpers ── */
function SummaryRow({ label, value, highlight }) {
    return (
        <div className="flex justify-between text-xs gap-4">
            <span className="text-slate-400 flex-shrink-0">{label}:</span>
            <span className={`font-semibold text-right ${highlight ? "text-blue-400 font-bold" : "text-white"}`}>
                {value}
            </span>
        </div>
    );
}

function ConfirmRow({ label, value, mono }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">{label}</span>
            <span className={`text-xs font-semibold text-slate-800 text-right ${mono ? "font-mono text-[10px] break-all" : ""}`}>
                {value}
            </span>
        </div>
    );
}
