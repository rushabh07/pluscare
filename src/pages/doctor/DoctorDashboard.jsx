import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiUser,
  FiLogOut,
  FiActivity,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiCheckSquare,
  FiEye,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiClock,
  FiX,
  FiSun,
  FiMoon,
  FiLayers,
  FiMapPin,
  FiPhone,
  FiTruck,
  FiPlay,
  FiCheck
} from "react-icons/fi";
import api, { appointmentService, serviceBookingApi } from "../../services/api";
import DoctorMedicalRecords from "./DoctorMedicalRecords";
import ProfileModal from "../../components/ProfileModal";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("serviceRequests"); // "serviceRequests" | "appointments" | "records"
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("doctorTheme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("doctorTheme", JSON.stringify(nextTheme));
      return nextTheme;
    });
  };

  // Appointments & Service Bookings state
  const [appointments, setAppointments] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Filtering state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notifications & Modals
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Doctor info
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("userInfo") || "{}"));
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchData = async () => {
    if (!user.token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const [appRes, servRes] = await Promise.all([
        appointmentService.getAppointments().catch(() => ({ data: [] })),
        serviceBookingApi.getProviderBookings().catch(() => ({ data: [] })),
      ]);

      const mineAppts = (appRes.data || []).filter(
        (a) => (a.doctor?._id || a.doctor) === user._id
      );
      setAppointments(mineAppts);
      setServiceBookings(servRes.data || []);
    } catch (err) {
      console.error("Fetch doctor data error:", err);
      setErrorMsg("Failed to load doctor dashboard records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const STATUS_COLORS = {
    Pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Accepted: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    "On The Way": "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Started: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    Completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Cancelled: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    Rejected: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    Confirmed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  };

  // Service Booking Status Update Handler
  const handleUpdateServiceBookingStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await serviceBookingApi.updateStatus(id, newStatus);
      setSuccessMsg(`Service Booking status updated to '${newStatus}' successfully!`);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Appointment Action Status Update
  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await appointmentService.updateStatus(id, { status: newStatus });
      setSuccessMsg(`Appointment status updated to '${newStatus}' successfully!`);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? res.data : a))
      );
      if (selectedAppointment && selectedAppointment._id === id) {
        setSelectedAppointment(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to change status to ${newStatus}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    if (dateFilter) {
      const apptDateStr = a.appointmentDate
        ? new Date(a.appointmentDate).toISOString().split("T")[0]
        : "";
      if (apptDateStr !== dateFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patientName = a.patient?.fullName?.toLowerCase() || "";
      const patientEmail = a.patient?.email?.toLowerCase() || "";
      if (!patientName.includes(q) && !patientEmail.includes(q)) return false;
    }
    return true;
  });

  // Dynamic Theme Tokens
  const pageBg = isDarkMode ? "bg-gray-950 text-white" : "bg-slate-50 text-slate-900";
  const cardBg = isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm";
  const inputBg = isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900";
  const tableHeaderBg = isDarkMode ? "bg-gray-800/60 text-gray-400 border-gray-800" : "bg-slate-100 text-slate-600 border-slate-200";
  const tableRowHover = isDarkMode ? "hover:bg-gray-800/40" : "hover:bg-slate-50";
  const textSub = isDarkMode ? "text-gray-400" : "text-slate-500";

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-sans transition-colors duration-300 ${pageBg}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-xl text-white shadow-lg shadow-teal-500/20">
              <FiActivity />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user.fullName || "Doctor"}</h1>
              <p className={`text-sm ${textSub}`}>
                {user.specialization ? `${user.specialization} • ` : ""}{user.department || "Medical Department"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Tab Navigation Controls */}
            <div className={`flex p-1 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700/60" : "bg-slate-100 border-slate-200"}`}>
              <button
                onClick={() => setActiveTab("serviceRequests")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "serviceRequests"
                    ? "bg-teal-500 text-white shadow-md"
                    : `${textSub} hover:text-teal-500`
                }`}
              >
                <FiLayers /> Service Requests ({serviceBookings.length})
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "appointments"
                    ? "bg-teal-500 text-white shadow-md"
                    : `${textSub} hover:text-teal-500`
                }`}
              >
                <FiCalendar /> Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "records"
                    ? "bg-teal-500 text-white shadow-md"
                    : `${textSub} hover:text-teal-500`
                }`}
              >
                <FiFileText /> Medical Records
              </button>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center text-sm cursor-pointer ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isDarkMode ? <FiSun className="text-amber-400 text-lg" /> : <FiMoon className="text-indigo-600 text-lg" />}
            </button>

            {/* Edit Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <FiUser /> Edit Profile
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-xl flex items-center gap-2 text-xs font-medium transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
            <FiCheckCircle className="text-lg flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
            <FiAlertCircle className="text-lg flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 0: SERVICE REQUESTS MANAGEMENT */}
        {activeTab === "serviceRequests" && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Assigned Service Requests</h2>
                  <p className={`text-xs ${textSub}`}>
                    Manage customer service bookings, accept/reject requests, and update fulfillment status step-by-step.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
                  Loading service requests...
                </div>
              ) : serviceBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  <FiLayers className="text-4xl mx-auto mb-2 text-gray-600" />
                  <p>No service requests assigned to your provider profile.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {serviceBookings.map((b) => (
                    <div
                      key={b._id}
                      className={`p-5 rounded-2xl border space-y-4 shadow-md ${
                        isDarkMode ? "bg-gray-950 border-gray-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                            {b.service?.category || "Service"}
                          </span>
                          <h3 className="font-bold text-base mt-1">{b.service?.name}</h3>
                          <p className={`text-xs ${textSub} mt-0.5`}>
                            Patient: <strong>{b.user?.fullName || "Patient"}</strong>
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_COLORS[b.status]}`}>
                          {b.status}
                        </span>
                      </div>

                      <div className={`text-xs space-y-1.5 pt-2 border-t ${isDarkMode ? "border-gray-800" : "border-slate-200"}`}>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-teal-400" />
                          <span>
                            {new Date(b.bookingDate).toLocaleDateString()} @ <strong>{b.timeSlot}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-teal-400" />
                          <span>Address: {b.address}</span>
                        </div>
                        {b.user?.phone && (
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-teal-400" />
                            <span>Phone: {b.user.phone}</span>
                          </div>
                        )}
                        {b.notes && (
                          <p className="text-amber-400 pt-1 italic">
                            Notes: "{b.notes}"
                          </p>
                        )}
                      </div>

                      {/* Provider Action Buttons based on status */}
                      <div className="pt-3 border-t border-gray-800 flex flex-wrap gap-2 justify-end">
                        {b.status === "Pending" && (
                          <>
                            <button
                              disabled={updatingId === b._id}
                              onClick={() => handleUpdateServiceBookingStatus(b._id, "Rejected")}
                              className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              disabled={updatingId === b._id}
                              onClick={() => handleUpdateServiceBookingStatus(b._id, "Accepted")}
                              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FiCheck /> Accept Request
                            </button>
                          </>
                        )}

                        {b.status === "Accepted" && (
                          <button
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateServiceBookingStatus(b._id, "On The Way")}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FiTruck /> Mark "On The Way"
                          </button>
                        )}

                        {b.status === "On The Way" && (
                          <button
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateServiceBookingStatus(b._id, "Started")}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FiPlay /> Mark "Started"
                          </button>
                        )}

                        {b.status === "Started" && (
                          <button
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateServiceBookingStatus(b._id, "Completed")}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FiCheckCircle /> Complete Service
                          </button>
                        )}

                        {b.status === "Completed" && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            ✓ Service Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: APPOINTMENTS MODULE */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className="text-lg font-bold">Appointments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`border-b text-left ${tableHeaderBg}`}>
                    <tr>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredAppointments.map((a) => (
                      <tr key={a._id} className={tableRowHover}>
                        <td className="py-3.5 px-4 font-semibold">{a.patient?.fullName || "Patient"}</td>
                        <td className="py-3.5 px-4 text-gray-400">{a.department}</td>
                        <td className="py-3.5 px-4 text-gray-400">
                          {new Date(a.appointmentDate).toLocaleDateString()} @ {a.timeSlot}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_COLORS[a.status]}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {a.status === "Pending" && (
                            <button
                              onClick={() => handleUpdateStatus(a._id, "Confirmed")}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                            >
                              Confirm
                            </button>
                          )}
                          {a.status === "Confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(a._id, "Completed")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDICAL RECORDS MODULE */}
        {activeTab === "records" && (
          <DoctorMedicalRecords isDarkMode={isDarkMode} cardBg={cardBg} textSub={textSub} />
        )}
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={(updatedUser) => {
          setUser(prev => ({ ...prev, ...updatedUser }));
        }}
      />
    </div>
  );
}
