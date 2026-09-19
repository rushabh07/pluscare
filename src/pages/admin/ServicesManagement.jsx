import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw,
  FiLayers, FiDollarSign, FiStar, FiCalendar, FiUsers,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiX
} from "react-icons/fi";
import { serviceApi, adminServiceStatsApi, authService } from "../../services/api";

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    description: "",
    price: "",
    duration: 30,
    image: "",
    isAvailable: true,
    providers: [],
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [srvRes, statsRes, docRes] = await Promise.all([
        serviceApi.getServices({ limit: 100 }).catch(() => ({ data: { services: [] } })),
        adminServiceStatsApi.getStats().catch(() => ({ data: null })),
        authService.getDoctors().catch(() => ({ data: [] })),
      ]);

      setServices(srvRes.data?.services || []);
      setStats(statsRes.data);
      setDoctors(docRes.data || []);
    } catch (err) {
      console.error("Error loading admin service data:", err);
      setError("Failed to fetch service management data from MongoDB.");
    } flexFinally();
  };

  const flexFinally = () => setLoading(false);

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: "General Medicine",
      description: "",
      price: "",
      duration: 30,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
      isAvailable: true,
      providers: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration || 30,
      image: service.image,
      isAvailable: service.isAvailable,
      providers: service.providers ? service.providers.map((p) => p._id || p) : [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.category || !formData.description || !formData.price) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      if (editingService) {
        await serviceApi.updateService(editingService._id, formData);
        setSuccess(`Service '${formData.name}' updated successfully!`);
      } else {
        await serviceApi.createService(formData);
        setSuccess(`New service '${formData.name}' created successfully!`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save service record.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service '${name}'?`)) return;
    try {
      await serviceApi.deleteService(id);
      setSuccess(`Service '${name}' deleted successfully!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete service.");
    }
  };

  // Filtered Services List
  const filteredServices = services.filter((s) => {
    if (categoryFilter !== "All" && s.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = ["All", ...new Set(services.map((s) => s.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services & Providers Management</h1>
          <p className="text-slate-600 text-xs mt-1">
            Real MongoDB statistics and administration for services, categories, and provider assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <FiPlus /> Add New Service
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <FiCheckCircle /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Live MongoDB Service Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <FiLayers className="text-blue-700" /> Total Services
            </span>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalServices}</p>
            <span className="text-[10px] text-emerald-700 font-medium">
              {stats.activeServices} Active & Bookable
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <FiCalendar className="text-purple-600" /> Total Service Bookings
            </span>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalBookings}</p>
            <span className="text-[10px] text-slate-600">
              {stats.completedBookings} Completed
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <FiDollarSign className="text-emerald-700" /> Live Revenue
            </span>
            <p className="text-2xl font-extrabold text-emerald-700">₹{stats.totalRevenue}</p>
            <span className="text-[10px] text-slate-600">From verified bookings</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <FiStar className="text-amber-600" /> Avg Service Rating
            </span>
            <p className="text-2xl font-extrabold text-amber-600">★ {stats.avgRating}</p>
            <span className="text-[10px] text-slate-600">({stats.totalReviews} total reviews)</span>
          </div>
        </div>
      )}

      {/* Services Table & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search services by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500 animate-pulse">
            Loading services from MongoDB...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No services found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 text-left text-xs font-semibold">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                            {s.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₹{s.price}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.duration || 30} mins</td>
                    <td className="py-3.5 px-4 text-amber-600 font-bold">
                      ★ {s.rating || "5.0"} <span className="text-xs text-slate-500">({s.numReviews})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.isAvailable ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          Available
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Service"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Service"
                      >
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

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 text-slate-900 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-lg font-bold">
              {editingService ? "Edit Service" : "Add New Service"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology, Telehealth"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                  <select
                    value={formData.isAvailable ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Inactive / Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Assign Providers / Doctors</label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-white border border-slate-300 rounded-xl text-xs">
                  {doctors.map((doc) => {
                    const isChecked = formData.providers.includes(doc._id);
                    return (
                      <label key={doc._id} className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, providers: [...formData.providers, doc._id] });
                            } else {
                              setFormData({
                                ...formData,
                                providers: formData.providers.filter((p) => p !== doc._id),
                              });
                            }
                          }}
                          className="accent-blue-600"
                        />
                        <span>{doc.fullName} ({doc.specialization || "Doctor"})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  {editingService ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
