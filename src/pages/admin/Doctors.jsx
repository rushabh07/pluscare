import React, { useEffect, useState } from "react";
import { FiUserCheck, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import api from "../../services/api";
import { getDoctorInitial } from "../../utils/doctorUtils";

const INITIAL_FORM = { fullName: "", email: "", phone: "", gender: "Male", specialization: "", department: "", password: "" };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/doctors");
      setDoctors(res.data);
    } catch (err) {
      setError("Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const filtered = doctors.filter((d) =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(INITIAL_FORM); setEditId(null); setError(""); setShowModal(true); };
  const openEdit = (doc) => {
    setForm({ fullName: doc.fullName, email: doc.email, phone: doc.phone, gender: doc.gender, specialization: doc.specialization, department: doc.department, password: "" });
    setEditId(doc._id);
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess("Doctor deleted.");
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (editId) {
        await api.put(`/admin/users/${editId}`, { ...form, role: "Doctor" });
        setSuccess("Doctor updated successfully.");
      } else {
        await api.post("/users/register", { ...form, role: "Doctor" });
        setSuccess("Doctor added successfully.");
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">{doctors.length} doctors registered</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/30">
          <FiPlus /> Add Doctor
        </button>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {error || success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, specialization..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm animate-pulse">Loading doctors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No doctors found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800 bg-gray-800/50">
                <tr className="text-gray-500 text-left">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Specialization</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {getDoctorInitial(doc.fullName)}
                      </div>
                      <span>{doc.fullName}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{doc.email}</td>
                    <td className="px-5 py-3 text-gray-400">{doc.phone}</td>
                    <td className="px-5 py-3 text-gray-400">{doc.specialization || "—"}</td>
                    <td className="px-5 py-3 text-gray-400">{doc.department || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="font-semibold text-white">{editId ? "Edit Doctor" : "Add Doctor"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {[
                { name: "fullName", label: "Full Name", type: "text" },
                { name: "email",    label: "Email",     type: "email" },
                { name: "phone",    label: "Phone",     type: "text" },
                { name: "specialization", label: "Specialization", type: "text" },
                { name: "department",     label: "Department",     type: "text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.name !== "department"}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {!editId && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                {editId ? "Update Doctor" : "Add Doctor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
