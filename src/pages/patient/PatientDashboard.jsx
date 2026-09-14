import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiCalendar, FiFileText, FiLogOut, FiActivity,
  FiHome, FiPlus, FiRefreshCw, FiAlertCircle, FiStar, FiX, FiCheckCircle, FiUser
} from "react-icons/fi";
import api, { appointmentService, doctorService, serviceBookingApi, reviewApi } from "../../services/api";
import ProfileModal from "../../components/ProfileModal";

const STATUS_COLORS = {
  Pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Accepted: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "On The Way": "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  Started: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
  Completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  Rejected: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
};

const SERVICE_STATUS_STEPS = ["Pending", "Accepted", "On The Way", "Started", "Completed"];

/* ── Inline Review Modal ── */
function LeaveReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("Please write a short comment about your experience.");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.createReview({
        bookingId: booking._id,
        rating,
        comment,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FiX className="text-xl" />
        </button>

        <h3 className="text-lg font-bold">Leave Service Review</h3>
        <p className="text-xs text-gray-400">
          How was your experience with <strong>{booking.service?.name}</strong> provided by{" "}
          <strong>{booking.provider?.fullName}</strong>?
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl cursor-pointer transition-transform ${
                    rating >= star ? "text-amber-400 scale-110" : "text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-amber-400">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">Review Comment</label>
            <textarea
              rows="3"
              required
              placeholder="Tell us about the service quality, punctuality, and overall satisfaction..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Inline Appointment Booking Form for Patients ── */
function InlineBookingForm({ onBooked, onClose }) {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    doctorId: "",
    department: "General Medicine",
    date: "",
    time: "",
    reason: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoadingDoctors(true);
    doctorService
      .getDoctors()
      .then((res) => {
        const docList = res.data || [];
        setDoctors(docList);
        if (docList.length > 0) {
          setForm((p) => ({
            ...p,
            doctorId: docList[0]._id,
            department: docList[0].department || "General Medicine",
          }));
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load doctors.");
      })
      .finally(() => setLoadingDoctors(false));
  }, []);

  const handleDoctorChange = (e) => {
    const selected = doctors.find((d) => d._id === e.target.value);
    set("doctorId", e.target.value);
    if (selected?.department) set("department", selected.department);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.doctorId) {
      setError("Please select a doctor.");
      return;
    }
    setSubmitting(true);
    try {
      await appointmentService.createAppointment({
        doctor: form.doctorId,
        department: form.department,
        appointmentDate: form.date,
        timeSlot: form.time,
        reason: form.reason || "General Consultation",
      });
      setSuccess(true);
      if (onBooked) onBooked();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Appointment Booked!</h3>
        <p className="text-gray-400 text-sm mb-4">Your appointment has been saved in the database.</p>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1.5">
          Select Doctor {loadingDoctors && <span className="text-blue-400 font-normal">(Loading...)</span>}
        </label>
        <select
          required
          value={form.doctorId}
          onChange={handleDoctorChange}
          disabled={loadingDoctors}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
        >
          <option value="">-- Select a Doctor --</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.fullName} {d.specialization ? `— ${d.specialization}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1.5">Department</label>
        <select
          value={form.department}
          onChange={(e) => set("department", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
        >
          {["General Medicine", "Cardiology", "Neurology", "Orthopedics", "Oncology"].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">Appointment Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">Time Slot</label>
          <select
            required
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="">Choose time</option>
            {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1.5">Reason (Optional)</label>
        <input
          type="text"
          placeholder="e.g. Routine check-up, Chest pain..."
          value={form.reason}
          onChange={(e) => set("reason", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || doctors.length === 0}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
        >
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );
}

/* ── Patient Dashboard ── */
export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("serviceBookings"); // 'serviceBookings' or 'clinicAppointments'
  const [appointments, setAppointments] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("userInfo") || "{}"));

  const fetchData = () => {
    if (!user.token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");

    Promise.all([
      api.get("/appointments").catch(() => ({ data: [] })),
      serviceBookingApi.getUserBookings().catch(() => ({ data: [] })),
    ])
      .then(([appRes, servRes]) => {
        const mineApp = (appRes.data || []).filter(
          (a) => a.patient?._id === user._id || a.patient === user._id
        );
        setAppointments(mineApp);
        setServiceBookings(servRes.data || []);
      })
      .catch((err) => {
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelServiceBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this service booking?")) return;
    try {
      await serviceBookingApi.cancelBooking(bookingId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <FiActivity />
            </div>
            <div>
              <h1 className="text-xl font-bold">Hello, {user.fullName}</h1>
              <p className="text-gray-500 text-sm">Patient Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/services"
              className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-colors font-bold shadow-lg"
            >
              Browse Services Directory
            </Link>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-colors font-bold shadow-lg cursor-pointer"
            >
              <FiUser /> Edit Profile
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <FiHome /> Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
              <FiCalendar />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Service Bookings</p>
              <p className="text-2xl font-bold text-white">
                {serviceBookings.filter((b) => !["Completed", "Cancelled", "Rejected"].includes(b.status)).length}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
              ✓
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed Services</p>
              <p className="text-2xl font-bold text-white">
                {serviceBookings.filter((b) => b.status === "Completed").length}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
              <FiFileText />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Clinic Appointments</p>
              <p className="text-2xl font-bold text-white">{appointments.length}</p>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-800 gap-4">
          <button
            onClick={() => setActiveTab("serviceBookings")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "serviceBookings"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            My Service Bookings ({serviceBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("clinicAppointments")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "clinicAppointments"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Clinic Appointments ({appointments.length})
          </button>
        </div>

        {/* TAB 1: Service Bookings with Status Tracker and Review Option */}
        {activeTab === "serviceBookings" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Healthcare & Local Service Bookings</h2>
              <button
                onClick={fetchData}
                className="text-gray-500 hover:text-white text-xs flex items-center gap-1"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm animate-pulse">
                Fetching service bookings from MongoDB...
              </div>
            ) : serviceBookings.length === 0 ? (
              <div className="p-8 text-center">
                <FiCalendar className="text-4xl text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No service bookings found.</p>
                <Link
                  to="/services"
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Browse Services Directory to Book
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {serviceBookings.map((b) => {
                  const currentStepIdx = SERVICE_STATUS_STEPS.indexOf(b.status);
                  const isCompleted = b.status === "Completed";
                  const isCancelled = ["Cancelled", "Rejected"].includes(b.status);

                  return (
                    <div
                      key={b._id}
                      className="bg-gray-950 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-lg"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                            {b.service?.category || "Service"}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1">
                            {b.service?.name || "Service Booking"}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Provider: <strong>{b.provider?.fullName || "Assigned Specialist"}</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: {new Date(b.bookingDate).toLocaleDateString()} @ {b.timeSlot}
                          </p>
                          <p className="text-xs text-gray-500">Address: {b.address}</p>
                        </div>

                        <div className="text-right space-y-2">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold inline-block ${
                              STATUS_COLORS[b.status] || "bg-gray-800 text-gray-300"
                            }`}
                          >
                            {b.status}
                          </span>
                          <div className="text-sm font-extrabold text-emerald-400">
                            ₹{b.totalPrice}
                          </div>

                          {/* Actions */}
                          {["Pending", "Accepted"].includes(b.status) && (
                            <button
                              onClick={() => handleCancelServiceBooking(b._id)}
                              className="block text-xs text-red-400 hover:text-red-300 underline font-semibold ml-auto"
                            >
                              Cancel Booking
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              onClick={() => setReviewBooking(b)}
                              className="block text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold shadow-md cursor-pointer ml-auto"
                            >
                              ★ Leave Review
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Real-time Status Tracker Step Bar */}
                      {!isCancelled && (
                        <div className="pt-4 border-t border-gray-900 space-y-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Live Status Tracker
                          </p>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                            {SERVICE_STATUS_STEPS.map((stepName, idx) => {
                              const isPassed = currentStepIdx >= idx;
                              const isCurrent = currentStepIdx === idx;
                              return (
                                <div
                                  key={stepName}
                                  className={`flex items-center gap-1 ${
                                    isPassed ? "text-blue-400 font-bold" : "text-gray-600"
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                                      isPassed ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"
                                    }`}
                                  >
                                    {isPassed ? "✓" : idx + 1}
                                  </span>
                                  <span className="hidden sm:inline">{stepName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Clinic Appointments */}
        {activeTab === "clinicAppointments" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Clinic Appointments</h2>
              <button
                onClick={() => setShowBooking(true)}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                + Book Appointment
              </button>
            </div>

            {showBooking && (
              <div className="mb-6 p-5 bg-gray-950 border border-gray-800 rounded-xl">
                <InlineBookingForm onBooked={() => { setShowBooking(false); fetchData(); }} onClose={() => setShowBooking(false)} />
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No clinic appointments.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-800 text-gray-500 text-left">
                    <tr>
                      <th className="py-2.5 px-3">Doctor</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {appointments.map((a) => (
                      <tr key={a._id}>
                        <td className="py-3 px-3 font-medium text-white">{a.doctor?.fullName || "—"}</td>
                        <td className="py-3 px-3 text-gray-400">{a.department}</td>
                        <td className="py-3 px-3 text-gray-400">
                          {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_COLORS[a.status]}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <LeaveReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            fetchData();
          }}
        />
      )}

      {/* Profile Modal */}
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
