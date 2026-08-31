import React, { useEffect, useState } from "react";
import { FiUsers, FiCalendar, FiLayers, FiDollarSign, FiActivity, FiTrendingUp, FiUserCheck, FiClock } from "react-icons/fi";
import api from "../../services/api";

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-700 transition-all duration-200`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color} flex-shrink-0`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value ?? "—"}</p>
      {trend && (
        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
          <FiTrendingUp /> {trend}
        </p>
      )}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalDoctors: 0, totalPatients: 0, totalAppointments: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, apptsRes] = await Promise.all([
          api.get("/users"),
          api.get("/appointments"),
        ]);
        const users = usersRes.data;
        const appointments = apptsRes.data;

        const doctors = users.filter((u) => u.role === "Doctor");
        const patients = users.filter((u) => u.role === "Patient");

        setStats({
          totalUsers: users.length,
          totalDoctors: doctors.length,
          totalPatients: patients.length,
          totalAppointments: appointments.length,
        });

        setRecentAppointments(appointments.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statusColor = {
    Pending: "bg-yellow-500/20 text-yellow-400",
    Confirmed: "bg-blue-500/20 text-blue-400",
    Completed: "bg-emerald-500/20 text-emerald-400",
    Cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FiUsers />} label="Total Users" value={stats.totalUsers} color="bg-blue-500/20 text-blue-400" trend="All roles" />
          <StatCard icon={<FiUserCheck />} label="Doctors" value={stats.totalDoctors} color="bg-purple-500/20 text-purple-400" />
          <StatCard icon={<FiActivity />} label="Patients" value={stats.totalPatients} color="bg-cyan-500/20 text-cyan-400" />
          <StatCard icon={<FiCalendar />} label="Appointments" value={stats.totalAppointments} color="bg-emerald-500/20 text-emerald-400" />
        </div>
      )}

      {/* Recent Appointments */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <FiClock className="text-blue-400" /> Recent Appointments
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentAppointments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="text-left pb-3 font-medium">Patient</th>
                  <th className="text-left pb-3 font-medium">Doctor</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 text-white">{appt.patient?.fullName || appt.patient || "—"}</td>
                    <td className="py-3 text-gray-400">{appt.doctor?.fullName || appt.doctor || "—"}</td>
                    <td className="py-3 text-gray-400">
                      {appt.appointmentDate
                        ? new Date(appt.appointmentDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor[appt.status] || "bg-gray-700 text-gray-300"}`}>
                        {appt.status}
                      </span>
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
