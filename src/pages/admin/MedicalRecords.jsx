import React, { useEffect, useState } from "react";
import { FiFileText, FiSearch, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api";

const INITIAL_FORM = { patient: "", doctor: "", diagnosis: "", notes: "", prescriptions: [{ medicineName: "", dosage: "", duration: "" }] };

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, userRes] = await Promise.all([
        api.get("/medical-records"),
        api.get("/users"),
      ]);
      setRecords(recRes.data);
      setUsers(userRes.data);
    } catch (err) {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter((r) =>
    r.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medical record?")) return;
    try {
      await api.delete(`/medical-records/${id}`);
      setSuccess("Record deleted.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const updatePrescription = (i, field, value) => {
    const updated = [...form.prescriptions];
    updated[i][field] = value;
    setForm({ ...form, prescriptions: updated });
  };

  const addPrescription = () =>
    setForm({ ...form, prescriptions: [...form.prescriptions, { medicineName: "", dosage: "", duration: "" }] });

  const removePrescription = (i) =>
    setForm({ ...form, prescriptions: form.prescriptions.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("/medical-records", form);
      setSuccess("Medical record created.");
      setShowModal(false);
      setForm(INITIAL_FORM);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create record.");
    }
  };

  const patients = users.filter((u) => u.role === "Patient");
  const doctors  = users.filter((u) => u.role === "Doctor");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Medical Records</h1>
          <p className="text-gray-500 text-sm mt-1">{records.length} records</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(""); setForm(INITIAL_FORM); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/30">
          <FiPlus /> Add Record
        </button>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {error || success}
        </div>
      )}

      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by patient or diagnosis..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm animate-pulse">Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No medical records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800 bg-gray-800/50">
                <tr className="text-gray-500 text-left">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Doctor</th>
                  <th className="px-5 py-3 font-medium">Diagnosis</th>
                  <th className="px-5 py-3 font-medium">Prescriptions</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{r.patient?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-gray-400">{r.doctor?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-gray-400">{r.diagnosis}</td>
                    <td className="px-5 py-3 text-gray-400">{r.prescriptions?.length || 0} item(s)</td>
                    <td className="px-5 py-3 text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h2 className="font-semibold text-white">Add Medical Record</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Patient</label>
                <select required value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                  <option value="">Select patient</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Doctor</label>
                <select required value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                  <option value="">Select doctor</option>
                  {doctors.map((d) => <option key={d._id} value={d._id}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Diagnosis</label>
                <textarea required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none" />
              </div>

              {/* Prescriptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">Prescriptions</label>
                  <button type="button" onClick={addPrescription} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.prescriptions.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input placeholder="Medicine" required value={p.medicineName} onChange={(e) => updatePrescription(i, "medicineName", e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
                      <input placeholder="Dosage" required value={p.dosage} onChange={(e) => updatePrescription(i, "dosage", e.target.value)}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
                      <input placeholder="Duration" required value={p.duration} onChange={(e) => updatePrescription(i, "duration", e.target.value)}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
                      {form.prescriptions.length > 1 && (
                        <button type="button" onClick={() => removePrescription(i)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                Create Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
