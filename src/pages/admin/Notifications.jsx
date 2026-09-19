import React, { useEffect, useState } from "react";
import { FiBell, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api";

const TYPE_COLORS = {
  Info:    "bg-blue-100 text-blue-800 border border-blue-300",
  Warning: "bg-amber-100 text-amber-800 border border-amber-300",
  Alert:   "bg-red-100 text-red-800 border border-red-300",
  Success: "bg-emerald-100 text-emerald-800 border border-emerald-300",
};

const INITIAL_FORM = { title: "", message: "", type: "Info", recipient: "all" };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      setSuccess("Notification deleted.");
      fetchNotifications();
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("/notifications", form);
      setSuccess("Notification sent.");
      setShowModal(false);
      setForm(INITIAL_FORM);
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{notifications.length} notifications</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(""); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-200">
          <FiPlus /> Send Notification
        </button>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-50 text-red-800 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
          {error || success}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">No notifications found.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 hover:border-blue-200 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${TYPE_COLORS[n.type] || "bg-slate-100 text-slate-500"}`}>
                <FiBell />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{n.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] || "bg-slate-100 text-slate-500"}`}>{n.type}</span>
                </div>
                <p className="text-slate-600 text-sm">{n.message}</p>
                <p className="text-slate-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDelete(n._id)}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all flex-shrink-0">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Send Notification</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Message</label>
                <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all">
                  <option>Info</option><option>Warning</option><option>Alert</option><option>Success</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                Send Notification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
