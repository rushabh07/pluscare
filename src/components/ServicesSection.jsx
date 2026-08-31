import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaStar, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { serviceApi } from '../services/api';
import ServiceDetailsModal from './ServiceDetailsModal';

export default function ServicesSection() {
  const [liveServices, setLiveServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  useEffect(() => {
    serviceApi
      .getServices({ limit: 6 })
      .then((res) => {
        setLiveServices(res.data.services || []);
      })
      .catch((err) => {
        console.error("Error loading services for section:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="services" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
              Comprehensive Services
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Engineered for Modern Healthcare
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all cursor-pointer"
          >
            Explore All Services in Catalog <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-medium">Fetching active services from MongoDB...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {liveServices.map((s) => (
              <div
                key={s._id}
                onClick={() => setSelectedServiceId(s._id)}
                className="group bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 rounded-3xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {s.category}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <FaStar /> {s.rating || "5.0"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <FaClock className="text-blue-500" /> {s.duration || 30} min
                    <span className="mx-1 text-slate-300">•</span>
                    <strong className="text-slate-900 text-sm font-extrabold">₹{s.price}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Book Now <FaArrowRight className="text-[10px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedServiceId && (
        <ServiceDetailsModal
          serviceId={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </section>
  );
}
