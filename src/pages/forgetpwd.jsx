import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaKey, FaLock } from "react-icons/fa";
import { FiMail, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { authService } from "../services/api";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Enter OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (email) => {
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
    };

    // Step 1: Handle Sending OTP via Supabase SMTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        if (!email.trim()) {
            setError("Email address is required.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            const response = await authService.sendForgotPasswordOtp({ email });
            setLoading(false);

            setSuccess(response.data.message || "6-digit OTP code sent to your email!");
            setStep(2); // Move to OTP verification step
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.message || "Failed to send OTP code. Please try again.";
            setError(msg);
        }
    };

    // Step 2: Handle Verifying OTP & Password Reset
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        if (!otp.trim()) {
            setError("Please enter the 6-digit OTP code sent to your email.");
            return;
        }

        if (!newPassword) {
            setError("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please re-check.");
            return;
        }

        try {
            setLoading(true);
            const response = await authService.verifyForgotPasswordOtp({
                email,
                otp: otp.trim(),
                newPassword,
            });
            setLoading(false);

            setSuccess(response.data.message || "Password updated successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.message || "Invalid OTP token or reset request failed.";
            setError(msg);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
                        <FaHeartbeat className="text-white text-4xl" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center text-slate-900 mt-6">
                    Forgot Password
                </h1>

                <p className="text-center text-slate-500 mt-2 text-sm">
                    {step === 1
                        ? "Enter your registered email address to receive a 6-digit OTP code via Supabase SMTP."
                        : `Enter the 6-digit OTP code sent to ${email} and your new password.`}
                </p>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-4 my-6">
                    <div className={`flex items-center gap-2 font-semibold text-xs ${step === 1 ? "text-blue-600" : "text-emerald-600"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 1 ? "bg-blue-600" : "bg-emerald-600"}`}>
                            {step > 1 ? <FiCheckCircle /> : "1"}
                        </span>
                        Send OTP
                    </div>
                    <div className="w-8 h-0.5 bg-slate-200"></div>
                    <div className={`flex items-center gap-2 font-semibold text-xs ${step === 2 ? "text-blue-600" : "text-slate-400"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 2 ? "bg-blue-600" : "bg-slate-300"}`}>
                            2
                        </span>
                        Verify & Reset
                    </div>
                </div>

                {success && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm flex items-center gap-2">
                        <FiCheckCircle className="shrink-0 text-emerald-600" />
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="font-semibold text-sm text-slate-700">Email Address</label>
                            <div className="mt-2 flex items-center border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
                                <FiMail className="text-slate-400 mr-3 shrink-0" />
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full outline-none text-slate-800 placeholder-slate-400 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? "Sending OTP..." : "Send OTP Code"}
                            {!loading && <FiArrowRight />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="font-semibold text-sm text-slate-700">6-Digit OTP Code</label>
                            <div className="mt-1 flex items-center border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
                                <FaKey className="text-slate-400 mr-3 text-sm shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full outline-none text-slate-800 placeholder-slate-400 text-sm tracking-widest font-mono"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-sm text-slate-700">New Password</label>
                            <div className="mt-1 flex items-center border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
                                <FaLock className="text-slate-400 mr-3 text-sm shrink-0" />
                                <input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full outline-none text-slate-800 placeholder-slate-400 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-sm text-slate-700">Confirm New Password</label>
                            <div className="mt-1 flex items-center border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
                                <FaLock className="text-slate-400 mr-3 text-sm shrink-0" />
                                <input
                                    type="password"
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full outline-none text-slate-800 placeholder-slate-400 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold transition text-sm cursor-pointer"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-2/3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-60 cursor-pointer text-sm"
                            >
                                {loading ? "Updating..." : "Reset Password"}
                                {!loading && <FiArrowRight />}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-8 pt-4 border-t border-slate-100">
                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:text-blue-700 text-sm"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </section>
    );
}