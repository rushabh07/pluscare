import React, { useEffect, useState } from "react";
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import api from "../../services/api";

const INITIAL_FORM = { name: "", description: "", location: "", contactNumber: "", status: "Active" };

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const filtered = departments.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(INITIAL_FORM); setEditId(null); setError(""); setShowModal(true); };
  const openEdit = (d) => {
    setForm({ name: d.name, description: d.description, location: d.location, contactNumber: d.contactNumber, status: d.status, });
    setEditId(d._id);
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      setSuccess("Department deleted.");
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (editId) {
        await api.put(`/departments/${editId}`, form);
        setSuccess("Department updated.");
      } else {
        await api.post("/departments", form);
        setSuccess("Department created.");
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-500 text-sm mt-1">{departments.length} departments</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-200">
          <FiPlus /> Add Department
        </button>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-50 text-red-800 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
          {error || success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all" />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
          No departments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div key={dept._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{dept.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dept.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
                      {dept.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-all">
                    <FiEdit2 className="text-xs" />
                  </button>
                  <button onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all">
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-xs line-clamp-2">{dept.description || "No description."}</p>
              {dept.location && <p className="text-slate-500 text-xs mt-2">📍 {dept.location}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">{editId ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <p className="text-red-600 text-xs">{error}</p>}
              {[
                { name: "name", label: "Department Name", required: true },
                { name: "description", label: "Description", required: false },
                { name: "location", label: "Location", required: false },
                { name: "contactNumber", label: "Contact Number", required: false },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                  <input
                    required={f.required}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                {editId ? "Update Department" : "Create Department"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
