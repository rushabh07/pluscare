import React, { useState, useEffect } from "react";
import {
    FiPlus,
    FiEdit3,
    FiFileText,
    FiUser,
    FiCalendar,
    FiSearch,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiPlusCircle,
    FiTrash2,
    FiRefreshCw,
    FiShield
} from "react-icons/fi";
import { medicalRecordService } from "../../services/api";

export default function DoctorMedicalRecords({ isDarkMode = true }) {
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [records, setRecords] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // UI state for alerts/modals
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);

    // Current Doctor info from localStorage
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

    // Form state for Create/Edit
    const [formData, setFormData] = useState({
        patient: "",
        diagnosis: "",
        recordDate: new Date().toISOString().split("T")[0],
        notes: "",
        prescriptions: [{ medicineName: "", dosage: "", duration: "" }],
    });

    // Theme dynamic classes
    const cardBg = isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm";
    const headerBg = isDarkMode ? "bg-gray-800/40 border-gray-800" : "bg-slate-100/80 border-slate-200";
    const inputBg = isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400";
    const modalBg = isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl";
    const tableHeaderBg = isDarkMode ? "bg-gray-800/60 text-gray-400 border-gray-800" : "bg-slate-100 text-slate-600 border-slate-200";
    const tableRowHover = isDarkMode ? "hover:bg-gray-800/40" : "hover:bg-slate-50";
    const textSub = isDarkMode ? "text-gray-400" : "text-slate-500";
    const textMuted = isDarkMode ? "text-gray-500" : "text-slate-400";

    // Fetch initial data: Assigned Patients and Doctor's Medical Records
    const fetchData = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const [patientsRes, recordsRes] = await Promise.all([
                medicalRecordService.getAssignedPatients(),
                medicalRecordService.getDoctorRecords(),
            ]);
            setAssignedPatients(patientsRes.data || []);
            setRecords(recordsRes.data || []);
        } catch (err) {
            console.error("Failed to load medical records data:", err);
            setErrorMsg(err.response?.data?.message || "Failed to load medical records data from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Clear alert banners
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (errorMsg) {
            const timer = setTimeout(() => setErrorMsg(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    // Handle form prescription field changes
    const handlePrescriptionChange = (index, field, value) => {
        const updated = [...formData.prescriptions];
        updated[index][field] = value;
        setFormData({ ...formData, prescriptions: updated });
    };

    const addPrescriptionRow = () => {
        setFormData({
            ...formData,
            prescriptions: [...formData.prescriptions, { medicineName: "", dosage: "", duration: "" }],
        });
    };

    const removePrescriptionRow = (index) => {
        if (formData.prescriptions.length <= 1) return;
        const updated = formData.prescriptions.filter((_, i) => i !== index);
        setFormData({ ...formData, prescriptions: updated });
    };

    // Open Modal for Create
    const openCreateModal = () => {
        setEditingRecord(null);
        setFormData({
            patient: assignedPatients.length > 0 ? assignedPatients[0]._id : "",
            diagnosis: "",
            recordDate: new Date().toISOString().split("T")[0],
            notes: "",
            prescriptions: [{ medicineName: "", dosage: "", duration: "" }],
        });
        setIsCreateModalOpen(true);
    };

    // Open Modal for Edit
    const openEditModal = (record) => {
        setEditingRecord(record);
        setFormData({
            patient: record.patient?._id || record.patient,
            diagnosis: record.diagnosis || "",
            recordDate: record.createdAt ? new Date(record.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            notes: record.notes || "",
            prescriptions: record.prescriptions && record.prescriptions.length > 0
                ? record.prescriptions.map(p => ({
                    medicineName: p.medicineName || "",
                    dosage: p.dosage || "",
                    duration: p.duration || "",
                  }))
                : [{ medicineName: "", dosage: "", duration: "" }],
        });
        setIsCreateModalOpen(true);
    };

    // Submit Create or Edit Record
    const handleSubmitRecord = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!formData.patient && !editingRecord) {
            setErrorMsg("Please select an assigned patient.");
            return;
        }
        if (!formData.diagnosis.trim()) {
            setErrorMsg("Diagnosis is required.");
            return;
        }

        const cleanPrescriptions = formData.prescriptions.filter(
            p => p.medicineName.trim() && p.dosage.trim() && p.duration.trim()
        );

        setSubmitting(true);
        try {
            if (editingRecord) {
                const res = await medicalRecordService.updateRecord(editingRecord._id, {
                    diagnosis: formData.diagnosis,
                    notes: formData.notes,
                    recordDate: formData.recordDate,
                    prescriptions: cleanPrescriptions,
                });
                setSuccessMsg("Medical record updated successfully!");
                setRecords(prev => prev.map(r => r._id === res.data._id ? res.data : r));
            } else {
                const res = await medicalRecordService.createRecord({
                    patient: formData.patient,
                    diagnosis: formData.diagnosis,
                    notes: formData.notes,
                    recordDate: formData.recordDate,
                    prescriptions: cleanPrescriptions,
                });
                setSuccessMsg("Medical record created successfully!");
                setRecords(prev => [res.data, ...prev]);
            }
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Save record error:", err);
            setErrorMsg(err.response?.data?.message || "Failed to save medical record. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Filtered records
    const filteredRecords = records.filter((r) => {
        const matchesPatient = selectedPatientId === "ALL" || (r.patient?._id === selectedPatientId || r.patient === selectedPatientId);
        const patientName = r.patient?.fullName?.toLowerCase() || "";
        const patientEmail = r.patient?.email?.toLowerCase() || "";
        const diag = r.diagnosis?.toLowerCase() || "";
        const search = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || patientName.includes(search) || patientEmail.includes(search) || diag.includes(search);
        return matchesPatient && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border transition-colors ${cardBg}`}>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center text-xl">
                            <FiFileText />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Patient Medical Records</h1>
                            <p className={`text-sm ${textSub}`}>Manage diagnoses, prescriptions, and clinical notes for assigned patients</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
                            isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                        title="Refresh data"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button
                        onClick={openCreateModal}
                        disabled={assignedPatients.length === 0}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                    >
                        <FiPlus /> Create Record
                    </button>
                </div>
            </div>

            {/* Notification Alerts */}
            {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm animate-fade-in">
                    <FiCheckCircle className="text-lg flex-shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm animate-fade-in">
                    <FiAlertCircle className="text-lg flex-shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-center transition-colors ${cardBg}`}>
                {/* Patient Filter Tabs */}
                <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedPatientId("ALL")}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            selectedPatientId === "ALL"
                                ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                : isDarkMode ? "bg-gray-800/60 text-gray-400 hover:bg-gray-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        All Patients ({records.length})
                    </button>
                    {assignedPatients.map((pt) => (
                        <button
                            key={pt._id}
                            onClick={() => setSelectedPatientId(pt._id)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                selectedPatientId === pt._id
                                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                    : isDarkMode ? "bg-gray-800/60 text-gray-400 hover:bg-gray-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {pt.fullName}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search patient or diagnosis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors ${inputBg}`}
                    />
                </div>
            </div>

            {/* Records Table */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${cardBg}`}>
                {loading ? (
                    <div className="p-12 text-center text-sm flex flex-col items-center gap-3">
                        <FiRefreshCw className="animate-spin text-2xl text-teal-400" />
                        <span className={textSub}>Loading patient medical records...</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="p-12 text-center text-sm space-y-2">
                        <FiFileText className={`text-4xl mx-auto mb-2 ${textMuted}`} />
                        <p className={`font-medium ${textSub}`}>No medical records found.</p>
                        <p className={`text-xs ${textMuted}`}>
                            {assignedPatients.length === 0
                                ? "No patients assigned to you yet."
                                : "Click 'Create Record' to add diagnosis and prescription for an assigned patient."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className={`uppercase text-xs tracking-wider border-b ${tableHeaderBg}`}>
                                <tr>
                                    <th className="px-6 py-4">Record Date</th>
                                    <th className="px-6 py-4">Patient Info</th>
                                    <th className="px-6 py-4">Diagnosis</th>
                                    <th className="px-6 py-4">Prescription</th>
                                    <th className="px-6 py-4">Doctor</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? "divide-gray-800/60" : "divide-slate-200"}`}>
                                {filteredRecords.map((rec) => (
                                    <tr key={rec._id} className={`transition-colors ${tableRowHover}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 font-medium">
                                                <FiCalendar className="text-teal-400 text-xs" />
                                                {new Date(rec.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold">{rec.patient?.fullName || "Patient N/A"}</div>
                                            <div className={`text-xs ${textSub}`}>{rec.patient?.email || rec.patient?.phone || "—"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg text-xs font-semibold inline-block">
                                                {rec.diagnosis}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.prescriptions && rec.prescriptions.length > 0 ? (
                                                <div className="text-xs space-y-1">
                                                    <span className="font-medium text-cyan-500">
                                                        {rec.prescriptions.length} medicine(s)
                                                    </span>
                                                    <div className={`truncate max-w-xs ${textSub}`}>
                                                        {rec.prescriptions.map(p => p.medicineName).join(", ")}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className={`text-xs ${textMuted}`}>None</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-xs ${textSub}`}>
                                            Dr. {rec.doctor?.fullName || user.fullName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => setViewingRecord(rec)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                    isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => openEditModal(rec)}
                                                className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                                            >
                                                <FiEdit3 className="text-xs" /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MEDICAL RECORD MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col ${modalBg}`}>
                        {/* Modal Header */}
                        <div className={`p-5 flex justify-between items-center border-b ${headerBg}`}>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FiFileText className="text-teal-400" />
                                {editingRecord ? "Edit Medical Record" : "Create Patient Medical Record"}
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmitRecord} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-semibold mb-1 ${textSub}`}>
                                        Assigned Patient <span className="text-rose-500">*</span>
                                    </label>
                                    {editingRecord ? (
                                        <input
                                            type="text"
                                            disabled
                                            value={editingRecord.patient?.fullName || "Patient"}
                                            className={`w-full px-3.5 py-2.5 rounded-xl cursor-not-allowed opacity-75 ${inputBg}`}
                                        />
                                    ) : (
                                        <select
                                            value={formData.patient}
                                            onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                                            required
                                            className={`w-full px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 ${inputBg}`}
                                        >
                                            {assignedPatients.length === 0 && (
                                                <option value="">No assigned patients found</option>
                                            )}
                                            {assignedPatients.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.fullName} ({p.email || p.phone})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold mb-1 ${textSub}`}>
                                        Record Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.recordDate}
                                        onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                                        required
                                        className={`w-full px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 ${inputBg}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>
                                    Diagnosis <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acute Bronchitis, Type 2 Diabetes"
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    required
                                    className={`w-full px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 ${inputBg}`}
                                />
                            </div>

                            <div className={`space-y-3 pt-2 border-t ${isDarkMode ? "border-gray-800" : "border-slate-200"}`}>
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-semibold text-teal-400 uppercase tracking-wider">
                                        Prescriptions
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addPrescriptionRow}
                                        className="text-xs text-teal-500 hover:text-teal-400 flex items-center gap-1 font-medium"
                                    >
                                        <FiPlusCircle /> Add Medicine
                                    </button>
                                </div>

                                {formData.prescriptions.map((pres, idx) => (
                                    <div key={idx} className={`p-3 rounded-xl border space-y-2 ${isDarkMode ? "bg-gray-800/40 border-gray-800" : "bg-slate-50 border-slate-200"}`}>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={pres.medicineName}
                                                onChange={(e) => handlePrescriptionChange(idx, "medicineName", e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-teal-500 ${inputBg}`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                value={pres.dosage}
                                                onChange={(e) => handlePrescriptionChange(idx, "dosage", e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-teal-500 ${inputBg}`}
                                            />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Duration"
                                                    value={pres.duration}
                                                    onChange={(e) => handlePrescriptionChange(idx, "duration", e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-teal-500 ${inputBg}`}
                                                />
                                                {formData.prescriptions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePrescriptionRow(idx)}
                                                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>
                                    Clinical Notes & Observations
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter clinical findings..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className={`w-full px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 ${inputBg}`}
                                />
                            </div>

                            <div className={`pt-4 border-t flex justify-end gap-3 ${isDarkMode ? "border-gray-800" : "border-slate-200"}`}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className={`px-4 py-2 rounded-xl transition-colors ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : editingRecord ? "Update Record" : "Create Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW DETAILS MODAL */}
            {viewingRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col ${modalBg}`}>
                        <div className={`p-5 flex justify-between items-center border-b ${headerBg}`}>
                            <div className="flex items-center gap-2">
                                <FiFileText className="text-teal-400 text-xl" />
                                <h3 className="text-lg font-bold">Medical Record Details</h3>
                            </div>
                            <button
                                onClick={() => setViewingRecord(null)}
                                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 text-sm">
                            <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-4 rounded-xl border ${headerBg}`}>
                                <div>
                                    <p className={`text-xs ${textSub}`}>Diagnosis</p>
                                    <h4 className="text-lg font-bold text-teal-400">{viewingRecord.diagnosis}</h4>
                                </div>
                                <div className={`text-left sm:text-right text-xs ${textSub}`}>
                                    <p className="flex items-center gap-1 sm:justify-end">
                                        <FiCalendar className="text-teal-400" />
                                        {new Date(viewingRecord.createdAt).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border space-y-2 ${headerBg}`}>
                                    <h5 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FiUser /> Patient Information
                                    </h5>
                                    <p className="font-semibold">{viewingRecord.patient?.fullName || "N/A"}</p>
                                    <p className={`text-xs ${textSub}`}>Email: {viewingRecord.patient?.email || "—"}</p>
                                    <p className={`text-xs ${textSub}`}>Phone: {viewingRecord.patient?.phone || "—"}</p>
                                </div>

                                <div className={`p-4 rounded-xl border space-y-2 ${headerBg}`}>
                                    <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FiShield /> Attending Doctor
                                    </h5>
                                    <p className="font-semibold">Dr. {viewingRecord.doctor?.fullName || user.fullName}</p>
                                    <p className={`text-xs ${textSub}`}>Department: {viewingRecord.doctor?.department || "General Medicine"}</p>
                                </div>
                            </div>

                            <div>
                                <h5 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
                                    Prescriptions ({viewingRecord.prescriptions?.length || 0})
                                </h5>
                                {!viewingRecord.prescriptions || viewingRecord.prescriptions.length === 0 ? (
                                    <p className={`text-xs italic ${textMuted}`}>No prescriptions recorded.</p>
                                ) : (
                                    <div className={`overflow-hidden border rounded-xl ${isDarkMode ? "border-gray-800" : "border-slate-200"}`}>
                                        <table className="w-full text-left text-xs">
                                            <thead className={tableHeaderBg}>
                                                <tr>
                                                    <th className="p-3">Medicine</th>
                                                    <th className="p-3">Dosage</th>
                                                    <th className="p-3">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-slate-200"}`}>
                                                {viewingRecord.prescriptions.map((p, i) => (
                                                    <tr key={i}>
                                                        <td className="p-3 font-semibold">{p.medicineName}</td>
                                                        <td className="p-3 text-cyan-400">{p.dosage}</td>
                                                        <td className={`p-3 ${textSub}`}>{p.duration}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h5 className={`text-xs font-bold uppercase tracking-wider mb-2 ${textSub}`}>
                                    Clinical Notes
                                </h5>
                                <div className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${headerBg}`}>
                                    {viewingRecord.notes || "No notes attached to this record."}
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border-t flex justify-end ${headerBg}`}>
                            <button
                                onClick={() => setViewingRecord(null)}
                                className={`px-5 py-2 rounded-xl font-medium text-xs transition-colors ${
                                    isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
