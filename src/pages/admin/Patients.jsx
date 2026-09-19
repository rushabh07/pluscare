import React, { useEffect, useState } from "react";
import { FiUser, FiSearch, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import api from "../../services/api";

const INITIAL_FORM = { fullName: "", email: "", phone: "", gender: "Male", dob: "", address: "", password: "" };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setPatients(res.data.filter((u) => u.role === "Patient"));
    } catch (err) {
      setError("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const openAdd = () => { setForm(INITIAL_FORM); setEditId(null); setError(""); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ fullName: p.fullName, email: p.email, phone: p.phone, gender: p.gender, dob: p.dob?.slice(0, 10) || "", address: p.address, password: "" });
    setEditId(p._id);
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess("Patient deleted.");
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (editId) {
        await api.put(`/admin/users/${editId}`, { ...form, role: "Patient" });
        setSuccess("Patient updated.");
      } else {
        await api.post("/users/register", { ...form, role: "Patient" });
        setSuccess("Patient added.");
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 text-sm mt-1">{patients.length} patients registered</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-200">
          <FiPlus /> Add Patient
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading patients...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No patients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-slate-500 text-left">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Gender</th>
                  <th className="px-5 py-3 font-medium">Date of Birth</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-900 font-medium">{p.fullName}</td>
                    <td className="px-5 py-3 text-slate-600">{p.email}</td>
                    <td className="px-5 py-3 text-slate-600">{p.phone}</td>
                    <td className="px-5 py-3 text-slate-600">{p.gender}</td>
                    <td className="px-5 py-3 text-slate-600">{p.dob ? new Date(p.dob).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-all">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all">
                          <FiTrash2 />
                        </button>
                      </div>
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">{editId ? "Edit Patient" : "Add Patient"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <p className="text-red-600 text-xs">{error}</p>}
              {[
                { name: "fullName", label: "Full Name", type: "text" },
                { name: "email",    label: "Email",     type: "email" },
                { name: "phone",    label: "Phone",     type: "text" },
                { name: "dob",      label: "Date of Birth", type: "date" },
                { name: "address",  label: "Address",   type: "text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={!["dob", "address"].includes(f.name)}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              {!editId && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Password</label>
                  <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              )}
              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                {editId ? "Update Patient" : "Add Patient"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
