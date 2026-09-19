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
          <h1 className="text-2xl font-extrabold text-slate-900">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Hospital performance overview</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-3 bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-500 text-sm" />
          <span className="text-slate-500 text-sm">Filter by date:</span>
        </div>
        <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500" />
        <span className="text-slate-500 text-sm self-center">to</span>
        <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500" />
        {(dateRange.from || dateRange.to) && (
          <button onClick={() => setDateRange({ from: "", to: "" })} className="text-xs text-slate-500 hover:text-slate-700 transition-colors">Clear</button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FiCalendar />, label: "Appointments", value: filteredAppts.length, color: "text-blue-800 bg-blue-100" },
              { icon: <FiUsers />,    label: "Doctors",      value: doctors,              color: "text-purple-800 bg-purple-100" },
              { icon: <FiUsers />,    label: "Patients",     value: patients,             color: "text-cyan-800 bg-cyan-100" },
              { icon: <FiDollarSign />, label: "Revenue Collected", value: `₹${totalRevenue.toLocaleString()}`, color: "text-emerald-800 bg-emerald-100" },
            ].map((c, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color} flex-shrink-0`}>{c.icon}</div>
                <div>
                  <p className="text-slate-500 text-sm">{c.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Appointment Status Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-900 mb-5">Appointment Status Breakdown</h2>
            <div className="space-y-3">
              {apptByStatus.map((item) => {
                const pct = filteredAppts.length > 0 ? Math.round((item.count / filteredAppts.length) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{item.status}</span>
                      <span className="text-sm text-slate-900 font-medium">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">Billing Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              {["Paid", "Pending", "Overdue"].map((s) => {
                const items = filteredBills.filter((b) => b.status === s);
                const total = items.reduce((sum, b) => sum + (b.amount || 0), 0);
                const color = s === "Paid" ? "text-emerald-700" : s === "Pending" ? "text-amber-700" : "text-red-600";
                return (
                  <div key={s} className="bg-slate-100 rounded-xl p-4 text-center">
                    <p className="text-slate-500 text-xs mb-1">{s}</p>
                    <p className={`text-lg font-bold ${color}`}>₹{total.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{items.length} bill{items.length !== 1 ? "s" : ""}</p>
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
