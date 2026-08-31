import { useState, useEffect } from 'react';
import { doctorService } from '../services/api';
import { FiUserCheck, FiPhone, FiMail, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { getDoctorInitial } from '../utils/doctorUtils';

export default function DoctorsSection({ onBook }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(err.response?.data?.message || 'Failed to load doctors from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <section id="doctors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Our Clinicians</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Board-Certified Specialists</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">Meet our verified medical doctors, providing expert and compassionate healthcare.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <FiRefreshCw className="animate-spin text-3xl text-blue-600 mb-3" />
            <p className="text-sm font-medium">Fetching doctor profiles from database...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center flex flex-col items-center gap-2">
            <FiAlertCircle className="text-2xl text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={fetchDoctors} className="text-xs bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors mt-1">
              Retry
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto">
            <FiUserCheck className="text-4xl text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Doctors Found</h3>
            <p className="text-xs text-slate-500">There are currently no doctor users registered in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div key={doc._id} className="group bg-slate-50/70 border border-slate-100 hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col">
                <div className="relative h-44 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-extrabold shadow-inner border border-white/30">
                    {getDoctorInitial(doc.fullName)}
                  </div>
                  <span className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <FiUserCheck className="text-xs text-teal-400" /> Verified Doctor
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">
                    {doc.fullName}
                  </h3>
                  
                  <span className="text-xs font-bold text-blue-600 mb-1">
                    {doc.specialization || 'General Practitioner'}
                  </span>
                  
                  <p className="text-[11px] text-slate-500 font-semibold mb-4">
                    Department: {doc.department || 'General Medicine'}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1 mb-5 flex-1 border-t border-slate-100 pt-3">
                    {doc.email && (
                      <div className="flex items-center gap-2">
                        <FiMail className="text-blue-500 shrink-0" />
                        <span className="truncate">{doc.email}</span>
                      </div>
                    )}
                    {doc.phone && (
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-blue-500 shrink-0" />
                        <span>{doc.phone}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onBook && onBook(doc.department || 'General Medicine', doc.fullName, doc._id)}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
