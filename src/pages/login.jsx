import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
} from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import { authService } from "../services/api";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "Patient",
        remember: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });

        setErrors({
            ...errors,
            [name]: "",
        });
    };

    const validate = () => {
        let temp = {};

        if (!formData.email.trim()) {
            temp.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            temp.email = "Invalid email address";
        }

        if (!formData.password) {
            temp.password = "Password is required";
        } else if (formData.password.length < 6) {
            temp.password = "Password must be at least 6 characters";
        }

        setErrors(temp);

        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const { data } = await authService.login({
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            // Save user info & JWT token in localStorage
            localStorage.setItem("userInfo", JSON.stringify(data));

            switch (data.role) {
                case "Admin":
                    navigate("/admin/dashboard");
                    break;
                case "Doctor":
                    navigate("/doctor/dashboard");
                    break;
                case "Receptionist":
                    navigate("/receptionist/dashboard");
                    break;
                default:
                    navigate("/patient/dashboard");
            }
        } catch (error) {
            setErrors({
                api: error.response?.data?.message || "Login failed. Please check credentials.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-6 py-10">
            <div className="grid lg:grid-cols-2 max-w-6xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

                {/* LEFT SIDE */}

                <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-600 via-sky-500 to-teal-500 text-white p-14 relative">

                    <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-16 -left-16 blur-3xl"></div>

                    <FaHeartbeat className="text-6xl mb-6" />

                    <h1 className="text-5xl font-extrabold">
                        Welcome to
                        <br />
                        PlusCare
                    </h1>

                    <p className="mt-6 text-blue-100 leading-8">
                        Securely access appointments,
                        prescriptions and your healthcare dashboard.
                    </p>

                </div>

                {/* RIGHT SIDE */}

                <div className="flex justify-center items-center p-10">

                    <div className="w-full max-w-md">

                        <h2 className="text-4xl font-bold text-slate-900">
                            Welcome Back
                        </h2>

                        <p className="text-slate-500 mt-3">
                            Login to your account
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            {errors.api && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm font-medium">
                                    {errors.api}
                                </div>
                            )}

                            {/* Role */}

                            <div>

                                <label className="text-sm font-semibold">
                                    Login As
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full mt-2 border rounded-xl px-4 py-3"
                                >
                                    <option>Patient</option>
                                    <option>Doctor</option>
                                    <option>Admin</option>

                                </select>

                            </div>

                            {/* Email */}

                            <div>

                                <label className="text-sm font-semibold">
                                    Email
                                </label>

                                <div className="mt-2 flex items-center border rounded-xl px-4 py-3">

                                    <FiMail className="mr-3 text-slate-400" />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        className="w-full outline-none"
                                    />

                                </div>

                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* Password */}

                            <div>

                                <label className="text-sm font-semibold">
                                    Password
                                </label>

                                <div className="mt-2 flex items-center border rounded-xl px-4 py-3">

                                    <FiLock className="mr-3 text-slate-400" />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className="w-full outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>

                                </div>

                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* Remember */}

                            <div className="flex justify-between items-center">

                                <label className="flex items-center gap-2 text-sm text-slate-600">

                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="accent-blue-600"
                                    />

                                    Remember Me

                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Forgot Password?
                                </Link>

                            </div>

                            {/* Login */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2"
                            >

                                {loading ? "Logging in..." : "Login"}

                                <FiArrowRight />

                            </button>

                            <p className="text-center text-slate-500">

                                Don't have an account?

                                <Link
                                    to="/register"
                                    className="text-blue-600 ml-2 font-semibold"
                                >
                                    Register
                                </Link>

                            </p>

                        </form>

                    </div>

                </div>

            </div>
        </section>
    );
}