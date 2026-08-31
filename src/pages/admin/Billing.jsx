import React, { useEffect, useState } from "react";
import { FiDollarSign, FiPlus, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import api from "../../services/api";

const STATUS_COLORS = {
  Paid:    "bg-emerald-500/20 text-emerald-400",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Overdue: "bg-red-500/20 text-red-400",
};

const INITIAL_FORM = { patient: "", amount: "", description: "", status: "Pending", dueDate: "" };

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billRes, userRes] = await Promise.all([
        api.get("/billing"),
        api.get("/users"),
      ]);
      setBills(billRes.data);
      setPatients(userRes.data.filter((u) => u.role === "Patient"));
    } catch (err) {
      setError("Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = bills.filter((b) =>
    b.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await api.delete(`/billing/${id}`);
      setSuccess("Bill deleted.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/billing/${id}`, { status });
      fetchData();
    } catch (err) {
      setError("Status update failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("/billing", form);
      setSuccess("Bill created.");
      setShowModal(false);
      setForm(INITIAL_FORM);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bill.");
    }
  };

  const totalRevenue = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + (b.amount || 0), 0);
  const totalPending = bills.filter((b) => b.status === "Pending").reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-gray-500 text-sm mt-1">{bills.length} total records</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(""); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/30">
          <FiPlus /> Create Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-500 text-sm">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-500 text-sm">Total Bills</p>
          <p className="text-2xl font-bold text-white mt-1">{bills.length}</p>
        </div>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {error || success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by patient or description..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all" />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm animate-pulse">Loading billing data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No bills found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800 bg-gray-800/50">
                <tr className="text-gray-500 text-left">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{bill.patient?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-gray-400">{bill.description}</td>
                    <td className="px-5 py-3 text-white font-semibold">₹{bill.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-400">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3">
                      <select value={bill.status} onChange={(e) => handleStatusChange(bill._id, e.target.value)}
                        className={`text-xs font-medium rounded-lg px-2 py-1 focus:outline-none cursor-pointer bg-transparent ${STATUS_COLORS[bill.status] || "text-gray-400"}`}>
                        <option className="bg-gray-900">Paid</option>
                        <option className="bg-gray-900">Pending</option>
                        <option className="bg-gray-900">Overdue</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(bill._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="font-semibold text-white">Create Bill</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Patient</label>
                <select required value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                  <option value="">Select patient</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                </select>
              </div>
              {[
                { name: "description", label: "Description", type: "text" },
                { name: "amount",      label: "Amount (₹)",  type: "number" },
                { name: "dueDate",     label: "Due Date",    type: "date" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} required={f.name !== "dueDate"} value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                  <option>Pending</option><option>Paid</option><option>Overdue</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                Create Bill
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
