import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiMapPin,
} from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import { authService } from "../services/api";

export default function Register() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        role: "Patient",
        specialization: "",
        department: "",
        address: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

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
        if (!formData.fullName.trim()) temp.fullName = "Full name is required";
        if (!formData.email.trim()) temp.email = "Email is required";
        if (!formData.phone.trim()) temp.phone = "Phone number is required";
        if (!formData.password) temp.password = "Password is required";
        if (formData.password !== formData.confirmPassword) temp.confirmPassword = "Passwords do not match";
        if (!formData.terms) temp.terms = "Please accept Terms & Conditions";

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const { data } = await authService.register(formData);
            localStorage.setItem("userInfo", JSON.stringify(data));
            navigate("/login");
        } catch (error) {
            setErrors({
                api: error.response?.data?.message || "Registration failed. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-6 py-10">

            <div className="grid lg:grid-cols-2 max-w-7xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* LEFT SIDE */}

                <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-600 via-sky-500 to-teal-500 text-white p-14">

                    <FaHeartbeat className="text-6xl mb-6" />

                    <h1 className="text-5xl font-extrabold leading-tight">
                        Join
                        <br />
                        PlusCare
                    </h1>

                    <p className="mt-6 text-blue-100 leading-8">
                        Create your account to book appointments,
                        manage medical records and access healthcare
                        services anytime.
                    </p>

                    <div className="grid grid-cols-2 gap-6 mt-10">

                        <div>
                            <h2 className="text-4xl font-bold">500+</h2>
                            <p>Doctors</p>
                        </div>

                        <div>
                            <h2 className="text-4xl font-bold">25+</h2>
                            <p>Departments</p>
                        </div>

                        <div>
                            <h2 className="text-4xl font-bold">50K+</h2>
                            <p>Patients</p>
                        </div>

                        <div>
                            <h2 className="text-4xl font-bold">24/7</h2>
                            <p>Emergency</p>
                        </div>

                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="p-10 md:p-14 overflow-y-auto">

                    <h2 className="text-4xl font-bold text-slate-900">
                        Create Account
                    </h2>

                    <p className="text-slate-500 mt-2 mb-8">
                        Register to access PlusCare.
                    </p>

                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
                        {errors.api && (
                            <div className="md:col-span-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                                {errors.api}
                            </div>
                        )}

                        {/* Full Name */}

                        <div>

                            <label className="font-semibold text-sm">
                                Full Name
                            </label>

                            <div className="flex items-center border rounded-xl px-4 py-3 mt-2">

                                <FiUser className="mr-3 text-slate-400" />

                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full outline-none"
                                />

                            </div>

                        </div>

                        {/* Email */}

                        <div>

                            <label className="font-semibold text-sm">
                                Email
                            </label>

                            <div className="flex items-center border rounded-xl px-4 py-3 mt-2">

                                <FiMail className="mr-3 text-slate-400" />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full outline-none"
                                />

                            </div>

                        </div>

                        {/* Phone */}

                        <div>

                            <label className="font-semibold text-sm">
                                Phone
                            </label>

                            <div className="flex items-center border rounded-xl px-4 py-3 mt-2">

                                <FiPhone className="mr-3 text-slate-400" />

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full outline-none"
                                />

                            </div>

                        </div>

                        {/* Gender */}

                        <div>

                            <label className="font-semibold text-sm">
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3 mt-2"
                            >
                                <option value="">Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>

                        </div>

                        {/* DOB */}

                        <div>

                            <label className="font-semibold text-sm">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3 mt-2"
                            />

                        </div>

                        {/* Role */}

                        <div>

                            <label className="font-semibold text-sm">
                                Register As
                            </label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border rounded-xl px-4 py-3 mt-2"
                            >
                                <option>Patient</option>
                                <option>Doctor</option>
                                <option>Admin</option>
                            </select>

                        </div>

                        {formData.role === "Doctor" && (
                            <>
                                <div>
                                    <label className="font-semibold text-sm">Specialist</label>
                                    <select
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="w-full border rounded-xl px-4 py-3 mt-2"
                                    >
                                        <option value="">Select Specialist</option>
                                        <option>Cardiologist</option>
                                        <option>Neurologist</option>
                                        <option>Orthopedic Surgeon</option>
                                        <option>Dermatologist</option>
                                        <option>Oncologist</option>
                                        <option>Psychiatrist</option>
                                        <option>Nephrologist</option>
                                        <option>Urologist</option>
                                        <option>General Surgeon</option>
                                        <option>General Physician</option>
                                        <option>Emergency Medicine</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-semibold text-sm">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full border rounded-xl px-4 py-3 mt-2"
                                    >
                                        <option value="">Select Department</option>
                                        <option>General Medicine</option>
                                        <option>Cardiology</option>
                                        <option>Neurology</option>
                                        <option>Pediatrics</option>
                                        <option>Orthopedics</option>
                                        <option>Dermatology</option>
                                        <option>Oncology</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Address */}

                        <div className="md:col-span-2">

                            <label className="font-semibold text-sm">
                                Address
                            </label>

                            <div className="flex items-center border rounded-xl px-4 py-3 mt-2">

                                <FiMapPin className="mr-3 text-slate-400" />

                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                    className="w-full outline-none"
                                />

                            </div>

                        </div>

                        {/* Password */}

                        <div>

                            <label className="font-semibold text-sm">
                                Password
                            </label>

                            <div className="flex items-center border rounded-xl px-4 py-3 mt-2">

                                <FiLock className="mr-3" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>

                            </div>

                        </div>

                        {/* Confirm Password */}

                        <div>

                            <label className="font-semibold text-sm">
                                Confirm Password
                            </label>

                            <div className="flex items-center border rounded-xl px-4 py-3 mt-2">

                                <FiLock className="mr-3" />

                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className="w-full outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                                </button>

                            </div>

                        </div>

                        {/* Terms */}

                        <div className="md:col-span-2">

                            <label className="flex items-center gap-2 text-sm">

                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                />

                                I agree to Terms & Conditions

                            </label>

                        </div>

                        {/* Button */}

                        <div className="md:col-span-2">

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2"
                            >
                                Create Account
                                <FiArrowRight />
                            </button>

                        </div>

                        <div className="md:col-span-2 text-center">

                            Already have an account?

                            <Link
                                to="/login"
                                className="text-blue-600 ml-2 font-semibold"
                            >
                                Login
                            </Link>

                        </div>

                    </form>

                </div>

            </div>

        </section>
    );
}