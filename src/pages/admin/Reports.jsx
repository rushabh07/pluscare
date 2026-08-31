import React, { useEffect, useState } from "react";
import { FiBarChart2, FiDownload, FiCalendar, FiUsers, FiDollarSign } from "react-icons/fi";
import api from "../../services/api";

export default function Reports() {
  const [data, setData] = useState({ appointments: [], users: [], billing: [] });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [apptRes, userRes, billRes] = await Promise.all([
          api.get("/appointments"),
          api.get("/users"),
          api.get("/billing"),
        ]);
        setData({ appointments: apptRes.data, users: userRes.data, billing: billRes.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filterByDate = (items, dateField) => {
    if (!dateRange.from && !dateRange.to) return items;
    return items.filter((item) => {
      const d = new Date(item[dateField] || item.createdAt);
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      return (!from || d >= from) && (!to || d <= to);
    });
  };

  const filteredAppts = filterByDate(data.appointments, "appointmentDate");
  const filteredBills  = filterByDate(data.billing, "createdAt");

  const apptByStatus = ["Pending", "Confirmed", "Completed", "Cancelled"].map((s) => ({
    status: s,
    count: filteredAppts.filter((a) => a.status === s).length,
  }));

  const totalRevenue = filteredBills.filter((b) => b.status === "Paid").reduce((s, b) => s + (b.amount || 0), 0);
  const doctors  = data.users.filter((u) => u.role === "Doctor").length;
  const patients = data.users.filter((u) => u.role === "Patient").length;

  const STATUS_COLORS = {
    Pending:   "bg-yellow-500",
    Confirmed: "bg-blue-500",
    Completed: "bg-emerald-500",
    Cancelled: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Hospital performance overview</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-500 text-sm" />
          <span className="text-gray-500 text-sm">Filter by date:</span>
        </div>
        <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        <span className="text-gray-600 text-sm self-center">to</span>
        <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        {(dateRange.from || dateRange.to) && (
          <button onClick={() => setDateRange({ from: "", to: "" })} className="text-xs text-gray-500 hover:text-white transition-colors">Clear</button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FiCalendar />, label: "Appointments", value: filteredAppts.length, color: "text-blue-400 bg-blue-500/20" },
              { icon: <FiUsers />,    label: "Doctors",      value: doctors,              color: "text-purple-400 bg-purple-500/20" },
              { icon: <FiUsers />,    label: "Patients",     value: patients,             color: "text-cyan-400 bg-cyan-500/20" },
              { icon: <FiDollarSign />, label: "Revenue Collected", value: `₹${totalRevenue.toLocaleString()}`, color: "text-emerald-400 bg-emerald-500/20" },
            ].map((c, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color} flex-shrink-0`}>{c.icon}</div>
                <div>
                  <p className="text-gray-500 text-sm">{c.label}</p>
                  <p className="text-xl font-bold text-white mt-0.5">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Appointment Status Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-5">Appointment Status Breakdown</h2>
            <div className="space-y-3">
              {apptByStatus.map((item) => {
                const pct = filteredAppts.length > 0 ? Math.round((item.count / filteredAppts.length) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">{item.status}</span>
                      <span className="text-sm text-white font-medium">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[item.status]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Billing Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              {["Paid", "Pending", "Overdue"].map((s) => {
                const items = filteredBills.filter((b) => b.status === s);
                const total = items.reduce((sum, b) => sum + (b.amount || 0), 0);
                const color = s === "Paid" ? "text-emerald-400" : s === "Pending" ? "text-yellow-400" : "text-red-400";
                return (
                  <div key={s} className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">{s}</p>
                    <p className={`text-lg font-bold ${color}`}>₹{total.toLocaleString()}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{items.length} bill{items.length !== 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
