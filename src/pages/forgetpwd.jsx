import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { FiMail, FiArrowRight } from "react-icons/fi";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (email) => {
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess("");
        setError("");

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            // Backend API
            // await authService.forgotPassword({ email });

            // Temporary success message
            setTimeout(() => {
                setSuccess(
                    "Password reset link has been sent to your registered email."
                );
                setLoading(false);
            }, 1500);

        } catch (err) {
            setLoading(false);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-6 py-10">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
                        <FaHeartbeat className="text-white text-4xl" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center text-slate-900 mt-6">
                    Forgot Password
                </h1>

                <p className="text-center text-slate-500 mt-3">
                    Enter your registered email address to receive a password reset link.
                </p>

                {success && (
                    <div className="mt-6 bg-green-100 border border-green-300 text-green-700 rounded-xl p-3 text-sm">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mt-6 bg-red-100 border border-red-300 text-red-700 rounded-xl p-3 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                    <div>
                        <label className="font-semibold text-sm text-slate-700">
                            Email Address
                        </label>

                        <div className="mt-2 flex items-center border rounded-xl px-4 py-3 focus-within:border-blue-600">

                            <FiMail className="text-slate-400 mr-3" />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full outline-none"
                            />

                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition disabled:opacity-60"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}

                        {!loading && <FiArrowRight />}
                    </button>

                </form>

                <div className="text-center mt-8">

                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:text-blue-700"
                    >
                        ← Back to Login
                    </Link>

                </div>

            </div>

        </section>
    );
}