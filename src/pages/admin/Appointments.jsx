import React, { useEffect, useState } from "react";
import { FiCalendar, FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api";

const STATUS_COLORS = {
  Pending:   "bg-amber-100 text-amber-800 border border-amber-300",
  Confirmed: "bg-blue-100 text-blue-800 border border-blue-300",
  Completed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  Cancelled: "bg-red-100 text-red-800 border border-red-300",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editAppt, setEditAppt] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.department?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setSuccess("Status updated.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      setSuccess("Appointment deleted.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">{appointments.length} total appointments</p>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${error ? "bg-red-50 text-red-800 border-red-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
          {error || success}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, department..."
            className="w-full pc-input pl-11 pr-4 py-3 text-sm placeholder-slate-400 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="pc-input px-4 py-3 text-sm min-w-[140px] transition-all"
        >
          <option value="All">All Status</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="pc-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-slate-500 text-left">
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-900 font-semibold">{appt.patient?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{appt.doctor?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{appt.department}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{appt.timeSlot}</td>
                    <td className="px-5 py-3">
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${STATUS_COLORS[appt.status] || "bg-slate-100 text-slate-700 border-slate-300"}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(appt._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all" aria-label="Delete appointment">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
