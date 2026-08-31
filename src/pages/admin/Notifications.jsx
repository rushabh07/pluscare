import React, { useEffect, useState } from "react";
import { FiBell, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api";

const TYPE_COLORS = {
  Info:    "bg-blue-500/20 text-blue-400",
  Warning: "bg-yellow-500/20 text-yellow-400",
  Alert:   "bg-red-500/20 text-red-400",
  Success: "bg-emerald-500/20 text-emerald-400",
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
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{notifications.length} notifications</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(""); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/30">
          <FiPlus /> Send Notification
        </button>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {error || success}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-sm">No notifications found.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start gap-4 hover:border-gray-700 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${TYPE_COLORS[n.type] || "bg-gray-700 text-gray-400"}`}>
                <FiBell />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm">{n.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] || "bg-gray-700 text-gray-400"}`}>{n.type}</span>
                </div>
                <p className="text-gray-400 text-sm">{n.message}</p>
                <p className="text-gray-600 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDelete(n._id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="font-semibold text-white">Send Notification</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Message</label>
                <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
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
