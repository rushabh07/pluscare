import React, { useEffect, useState } from "react";
import { FiCalendar, FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api";

const STATUS_COLORS = {
  Pending:   "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Confirmed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
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
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">{appointments.length} total appointments</p>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {error || success}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, department..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all min-w-[140px]"
        >
          <option value="All">All Status</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm animate-pulse">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800 bg-gray-800/50">
                <tr className="text-gray-500 text-left">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Doctor</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{appt.patient?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-gray-400">{appt.doctor?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-gray-400">{appt.department}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{appt.timeSlot}</td>
                    <td className="px-5 py-3">
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                        className={`text-xs font-medium rounded-lg px-2 py-1 border focus:outline-none cursor-pointer bg-transparent ${STATUS_COLORS[appt.status] || "bg-gray-700 text-gray-300 border-gray-600"}`}
                      >
                        <option className="bg-gray-900" value="Pending">Pending</option>
                        <option className="bg-gray-900" value="Confirmed">Confirmed</option>
                        <option className="bg-gray-900" value="Completed">Completed</option>
                        <option className="bg-gray-900" value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(appt._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
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
