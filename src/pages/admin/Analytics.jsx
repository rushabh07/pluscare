import React, { useEffect, useState } from "react";
import { FiPieChart, FiTrendingUp, FiActivity, FiUsers } from "react-icons/fi";
import api from "../../services/api";

const BAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-cyan-500", "bg-emerald-500",
  "bg-yellow-500", "bg-pink-500", "bg-orange-500", "bg-indigo-500"
];

export default function Analytics() {
  const [data, setData] = useState({ users: [], appointments: [], billing: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [u, a, b] = await Promise.all([
          api.get("/users"),
          api.get("/appointments"),
          api.get("/billing"),
        ]);
        setData({ users: u.data, appointments: a.data, billing: b.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Monthly appointment volume (last 6 months)
  const monthlyAppts = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const count = data.appointments.filter((a) => {
        const apptDate = new Date(a.appointmentDate || a.createdAt);
        const apptKey = `${apptDate.getFullYear()}-${String(apptDate.getMonth() + 1).padStart(2, "0")}`;
        return apptKey === key;
      }).length;
      months.push({ label, count });
    }
    return months;
  })();

  const maxAppts = Math.max(...monthlyAppts.map((m) => m.count), 1);

  // Department distribution from appointments
  const deptCount = {};
  data.appointments.forEach((a) => {
    if (a.department) deptCount[a.department] = (deptCount[a.department] || 0) + 1;
  });
  const depts = Object.entries(deptCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxDept = Math.max(...depts.map(([, c]) => c), 1);

  // Role breakdown
  const doctors  = data.users.filter((u) => u.role === "Doctor").length;
  const patients = data.users.filter((u) => u.role === "Patient").length;
  const admins   = data.users.filter((u) => u.role === "Admin").length;
  const total    = data.users.length || 1;

  const totalRevenue = data.billing.filter((b) => b.status === "Paid").reduce((s, b) => s + (b.amount || 0), 0);
  const avgPerBill   = data.billing.length ? (data.billing.reduce((s, b) => s + (b.amount || 0), 0) / data.billing.length).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Hospital performance insights</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Appointments Bar Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <FiTrendingUp className="text-blue-400" /> Monthly Appointments (Last 6 Months)
            </h2>
            <div className="flex items-end gap-3 h-36">
              {monthlyAppts.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{m.count}</span>
                  <div
                    className="w-full bg-blue-600 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(m.count / maxAppts) * 100}%`, minHeight: m.count > 0 ? "4px" : "0" }}
                  />
                  <span className="text-xs text-gray-500">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <FiActivity className="text-purple-400" /> Appointments by Department
            </h2>
            {depts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">No department data yet.</p>
            ) : (
              <div className="space-y-3">
                {depts.map(([dept, count], i) => (
                  <div key={dept}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400 truncate max-w-[160px]">{dept}</span>
                      <span className="text-sm text-white font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                        style={{ width: `${(count / maxDept) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Role Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <FiUsers className="text-cyan-400" /> User Role Distribution
            </h2>
            <div className="space-y-4">
              {[
                { label: "Patients", count: patients, color: "bg-cyan-500" },
                { label: "Doctors",  count: doctors,  color: "bg-purple-500" },
                { label: "Admins",   count: admins,   color: "bg-blue-500" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">{r.label}</span>
                    <span className="text-sm text-white font-medium">{r.count} ({Math.round((r.count / total) * 100)}%)</span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width: `${(r.count / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">Total: {data.users.length} users</p>
          </div>

          {/* Revenue Analytics */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <FiPieChart className="text-emerald-400" /> Revenue Analytics
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs">Total Collected</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs">Avg Bill Value</p>
                <p className="text-xl font-bold text-white mt-1">₹{Number(avgPerBill).toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs">Total Bills</p>
                <p className="text-xl font-bold text-white mt-1">{data.billing.length}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs">Pending Bills</p>
                <p className="text-xl font-bold text-yellow-400 mt-1">
                  {data.billing.filter((b) => b.status === "Pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
