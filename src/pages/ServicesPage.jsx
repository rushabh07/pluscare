import React, { useState, useEffect } from "react";
import {
  FiSearch, FiFilter, FiSliders, FiClock, FiStar,
  FiChevronLeft, FiChevronRight, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceDetailsModal from "../components/ServiceDetailsModal";
import { serviceApi } from "../services/api";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(250);
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);

  // Selected Service Modal
  const [activeServiceId, setActiveServiceId] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    serviceApi
      .getCategories()
      .then((res) => {
        setCategories(["All", ...(res.data || [])]);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch Services with debounce / effect
  useEffect(() => {
    fetchServices();
  }, [search, selectedCategory, maxPrice, availability, sortBy, page]);

  const fetchServices = () => {
    setLoading(true);
    setError("");

    const params = {
      search: search.trim() || undefined,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      maxPrice: maxPrice || undefined,
      isAvailable: availability !== "all" ? availability : undefined,
      sortBy,
      page,
      limit: 6,
    };

    serviceApi
      .getServices(params)
      .then((res) => {
        setServices(res.data.services || []);
        setTotalPages(res.data.pages || 1);
        setTotalServices(res.data.totalServices || 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load services from MongoDB.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onBook={() => setActiveServiceId(services[0]?._id)} />

      {/* Header Banner */}
      <div className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 relative z-10 text-center space-y-4">
          <span className="inline-block text-xs font-extrabold text-blue-400 bg-blue-900/60 border border-blue-700/50 px-4 py-1.5 rounded-full uppercase tracking-widest">
            Healthcare Services Directory
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Explore & Book Clinical Services
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Browse our full-stack service catalog powered by real-time MongoDB data. Filter by category, price, and availability, view specialist provider profiles, and book slots instantly.
          </p>
        </div>
      </div>

      {/* Main Services Explorer */}
      <div className="max-w-7xl mx-auto px-5 py-12 flex-1 w-full space-y-8">
        {/* Controls Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
          {/* Search + Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search services by name, description, or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="price_asc">Sort by Price: Low to High</option>
                <option value="price_desc">Sort by Price: High to Low</option>
                <option value="rating_desc">Sort by: Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <FiFilter /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Filters: Price Range & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Max Price Filter:</span>
                <strong className="text-blue-600 font-bold">₹{maxPrice}</strong>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-bold">Availability Status:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="avail"
                  value="all"
                  checked={availability === "all"}
                  onChange={() => {
                    setAvailability("all");
                    setPage(1);
                  }}
                  className="accent-blue-600"
                />
                All
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="avail"
                  value="true"
                  checked={availability === "true"}
                  onChange={() => {
                    setAvailability("true");
                    setPage(1);
                  }}
                  className="accent-blue-600"
                />
                Available Only
              </label>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-bold text-slate-600">
            Showing <span className="text-slate-900 font-extrabold">{services.length}</span> of{" "}
            <span className="text-slate-900 font-extrabold">{totalServices}</span> Services
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm font-medium">Querying MongoDB service records...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-600">
            <FiAlertCircle className="text-4xl mx-auto mb-2 text-red-500" />
            <p className="font-bold">{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              No clinical services match your selected search criteria. Try adjusting filters or category selections.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setMaxPrice(250);
                setAvailability("all");
              }}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map((s) => (
              <div
                key={s._id}
                className="group bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                    {s.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-amber-500 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <FiStar className="fill-amber-400" /> {s.rating || "5.0"}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {s.name}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] font-semibold">
                        <FiClock /> {s.duration || 30} mins
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        ₹{s.price}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveServiceId(s._id)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>
            <span className="text-xs font-bold text-slate-600 px-4">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Service Details & Booking Modal */}
      {activeServiceId && (
        <ServiceDetailsModal
          serviceId={activeServiceId}
          onClose={() => setActiveServiceId(null)}
          onBookingSuccess={() => {
            fetchServices();
          }}
        />
      )}

      <Footer />
    </div>
  );
}
