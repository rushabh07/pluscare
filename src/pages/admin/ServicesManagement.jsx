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
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services & Providers Management</h1>
          <p className="text-gray-400 text-xs mt-1">
            Real MongoDB statistics and administration for services, categories, and provider assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
          <FiCheckCircle /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Live MongoDB Service Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <FiLayers className="text-blue-400" /> Total Services
            </span>
            <p className="text-2xl font-extrabold text-white">{stats.totalServices}</p>
            <span className="text-[10px] text-emerald-400 font-medium">
              {stats.activeServices} Active & Bookable
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <FiCalendar className="text-purple-400" /> Total Service Bookings
            </span>
            <p className="text-2xl font-extrabold text-white">{stats.totalBookings}</p>
            <span className="text-[10px] text-gray-400">
              {stats.completedBookings} Completed
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <FiDollarSign className="text-emerald-400" /> Live Revenue
            </span>
            <p className="text-2xl font-extrabold text-emerald-400">₹{stats.totalRevenue}</p>
            <span className="text-[10px] text-gray-400">From verified bookings</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <FiStar className="text-amber-400" /> Avg Service Rating
            </span>
            <p className="text-2xl font-extrabold text-amber-400">★ {stats.avgRating}</p>
            <span className="text-[10px] text-gray-400">({stats.totalReviews} total reviews)</span>
          </div>
        </div>
      )}

      {/* Services Table & Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search services by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
            Loading services from MongoDB...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No services found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800 bg-gray-950/60 text-gray-400 text-left text-xs font-semibold">
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
              <tbody className="divide-y divide-gray-800">
                {filteredServices.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-800 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{s.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                            {s.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      <span className="bg-gray-800 border border-gray-700 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{s.price}</td>
                    <td className="py-3.5 px-4 text-gray-400">{s.duration || 30} mins</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">
                      ★ {s.rating || "5.0"} <span className="text-xs text-gray-500">({s.numReviews})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.isAvailable ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          Available
                        </span>
                      ) : (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg transition-colors cursor-pointer"
                        title="Edit Service"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-rose-400 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-lg font-bold">
              {editingService ? "Edit Service" : "Add New Service"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology, Telehealth"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.isAvailable ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Inactive / Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Assign Providers / Doctors</label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs">
                  {doctors.map((doc) => {
                    const isChecked = formData.providers.includes(doc._id);
                    return (
                      <label key={doc._id} className="flex items-center gap-2 p-1.5 hover:bg-gray-900 rounded cursor-pointer">
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
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold"
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
