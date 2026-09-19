import { useState, useEffect } from "react";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaVenusMars,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaStethoscope,
    FaBuilding,
    FaGraduationCap,
    FaRupeeSign,
    FaBriefcase,
    FaLock,
    FaTimes,
    FaCheck,
    FaUserCheck,
    FaShieldAlt,
} from "react-icons/fa";
import { authService } from "../services/api";

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
    const [activeTab, setActiveTab] = useState("personal"); // "personal" | "professional" | "security"
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [userRole, setUserRole] = useState("Patient");

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        gender: "Male",
        dob: "",
        address: "",
        // Doctor specific
        specialization: "",
        department: "",
        qualification: "",
        location: "",
        consultationFee: 500,
        experienceYears: 1,
        isAvailable: true,
        // Password fields
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchUserProfile();
        }
    }, [isOpen]);

    const fetchUserProfile = async () => {
        try {
            setFetching(true);
            setMessage({ type: "", text: "" });
            const res = await authService.getProfile();
            const data = res.data;

            setUserRole(data.role || "Patient");

            setFormData({
                fullName: data.fullName || "",
                email: data.email || "",
                phone: data.phone || "",
                gender: data.gender || "Male",
                dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
                address: data.address || "",
                specialization: data.specialization || "",
                department: data.department || "",
                qualification: data.qualification || "MBBS",
                location: data.location || data.address || "",
                consultationFee: data.consultationFee !== undefined ? data.consultationFee : 500,
                experienceYears: data.experienceYears !== undefined ? data.experienceYears : 1,
                isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            setMessage({ type: "error", text: "Failed to load profile data." });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setMessage({ type: "error", text: "Please enter your current password to set a new password." });
                return;
            }
            if (formData.newPassword.length < 6) {
                setMessage({ type: "error", text: "New password must be at least 6 characters long." });
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: "error", text: "New passwords do not match." });
                return;
            }
        }

        try {
            setLoading(true);
            const res = await authService.updateProfile(formData);
            const updatedUser = res.data;

            // Sync localStorage
            const localUser = JSON.parse(localStorage.getItem("userInfo")) || {};
            const refreshedUserInfo = {
                ...localUser,
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
                role: updatedUser.role,
                token: updatedUser.token || localUser.token,
            };
            localStorage.setItem("userInfo", JSON.stringify(refreshedUserInfo));

            setMessage({ type: "success", text: "Profile updated successfully!" });

            if (onProfileUpdated) {
                onProfileUpdated(updatedUser);
            }

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update profile. Please try again.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <FaUserCheck className="text-2xl text-teal-200" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
                            <p className="text-xs text-blue-100">
                                {userRole} Account & System Preferences
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                    >
                        <FaTimes className="text-white text-sm" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("personal")}
                        className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                            activeTab === "personal"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <FaUser className="text-xs" /> Personal Info
                    </button>

                    {userRole === "Doctor" && (
                        <button
                            type="button"
                            onClick={() => setActiveTab("professional")}
                            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                activeTab === "professional"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <FaStethoscope className="text-xs" /> Doctor Profile
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setActiveTab("security")}
                        className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                            activeTab === "security"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <FaShieldAlt className="text-xs" /> Password & Security
                    </button>
                </div>

                {/* Body Form */}
                <div className="p-6 overflow-y-auto grow">
                    {message.text && (
                        <div
                            className={`mb-5 p-3.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
                                message.type === "success"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                        >
                            {message.type === "success" ? (
                                <FaCheck className="shrink-0 text-emerald-600" />
                            ) : (
                                <FaTimes className="shrink-0 text-red-600" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {fetching ? (
                        <div className="py-12 text-center text-slate-400 font-medium text-sm">
                            Loading profile details...
                        </div>
                    ) : (
                        <form id="profileForm" onSubmit={handleSubmit} className="space-y-4">
                            {/* Tab 1: Personal Info */}
                            {activeTab === "personal" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Full Name
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
                                            <FaUser className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Email Address (Read Only)
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 cursor-not-allowed">
                                            <FaEnvelope className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full outline-none text-slate-500 text-xs sm:text-sm bg-transparent font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Phone Number
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
                                            <FaPhone className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Gender
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaVenusMars className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium bg-transparent"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Date of Birth
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaCalendarAlt className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Address / Residential Details
                                        </label>
                                        <div className="flex items-start border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaMapMarkerAlt className="text-slate-400 mr-2.5 text-xs shrink-0 mt-1" />
                                            <textarea
                                                name="address"
                                                rows="2"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Enter full address"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Professional Profile (Doctor Only) */}
                            {activeTab === "professional" && userRole === "Doctor" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Specialization / Title
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaStethoscope className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={formData.specialization}
                                                onChange={handleChange}
                                                placeholder="e.g. Cardiologist"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Department / Category
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaBuilding className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                placeholder="e.g. Cardiology"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Qualification
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaGraduationCap className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                name="qualification"
                                                value={formData.qualification}
                                                onChange={handleChange}
                                                placeholder="e.g. MBBS, MD"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Consultation Fee (₹)
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaRupeeSign className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="number"
                                                name="consultationFee"
                                                value={formData.consultationFee}
                                                onChange={handleChange}
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Experience (Years)
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaBriefcase className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="number"
                                                name="experienceYears"
                                                value={formData.experienceYears}
                                                onChange={handleChange}
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Clinic Location / Address
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaMapMarkerAlt className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Clinic / Hospital location"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between mt-2">
                                        <div>
                                            <span className="font-bold text-xs sm:text-sm text-slate-800 block">
                                                Available for Appointments & Service Bookings
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                Toggle your availability status for new patient bookings.
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isAvailable"
                                                checked={formData.isAvailable}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Security & Password Change */}
                            {activeTab === "security" && (
                                <div className="space-y-4 max-w-md mx-auto py-2">
                                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-2xl text-xs leading-relaxed">
                                        Leave password fields blank if you do not want to change your password.
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Current Password
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaLock className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                placeholder="Enter current password"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            New Password
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaLock className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="Minimum 6 characters"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Confirm New Password
                                        </label>
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 transition">
                                            <FaLock className="text-slate-400 mr-2.5 text-xs shrink-0" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter new password"
                                                className="w-full outline-none text-slate-800 text-xs sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="profileForm"
                        disabled={loading || fetching}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                        {loading ? "Saving Changes..." : "Save Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
}
