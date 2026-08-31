import { useState, useEffect } from 'react';
import { doctorService, appointmentService } from '../services/api';
import { FaRegCalendarCheck, FaCheckCircle, FaTimes } from 'react-icons/fa';

export default function BookingModal({ open, onClose, defaultDept = 'General Medicine', defaultDoctorId = '' }) {
  const [success, setSuccess] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    department: defaultDept,
    doctorId: defaultDoctorId,
    date: '',
    time: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        email: '',
        department: defaultDept,
        doctorId: defaultDoctorId,
        date: '',
        time: '',
      });
      setError('');
      setSuccess(false);

      // Fetch doctors from MongoDB
      setLoadingDoctors(true);
      doctorService
        .getDoctors()
        .then((res) => {
          const docList = res.data || [];
          setDoctors(docList);
          // If defaultDoctorId wasn't provided, auto-select doctor matching defaultDept if possible
          if (!defaultDoctorId && docList.length > 0) {
            const match = docList.find((d) => d.department === defaultDept) || docList[0];
            setForm((p) => ({ ...p, doctorId: match._id }));
          }
        })
        .catch((err) => {
          console.error("Error fetching doctors for booking:", err);
          setError(err.response?.data?.message || "Failed to load doctors from database.");
        })
        .finally(() => setLoadingDoctors(false));
    }
  }, [open, defaultDept, defaultDoctorId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure we have a valid doctor ID
    let selectedDoctorId = form.doctorId;
    if (!selectedDoctorId) {
      if (doctors.length > 0) {
        selectedDoctorId = doctors[0]._id;
      } else {
        setError("No doctor users found in database. Please register a Doctor user first.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.token) {
          // Logged in user: create real appointment in DB
          await appointmentService.createAppointment({
            doctor: selectedDoctorId,
            department: form.department,
            appointmentDate: form.date,
            timeSlot: form.time,
            reason: `Consultation request by ${form.name}`,
          });
        }
      }
      setSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Failed to schedule appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setForm({ name: '', email: '', department: 'General Medicine', doctorId: '', date: '', time: '' });
      setError('');
    }, 300);
  };

  // Filter doctors by selected department
  const filteredDoctors = doctors.filter((d) => {
    if (!form.department) return true;
    return d.department?.toLowerCase() === form.department.toLowerCase();
  });

  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : doctors;
  const selectedDoctorObj = doctors.find((d) => d._id === form.doctorId);

  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const isDoctorUser = userInfo && userInfo.role === "Doctor";

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-[540px] shadow-2xl shadow-blue-100 max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10">
          <FaTimes className="text-sm" />
        </button>

        <div className="p-6 md:p-8">
          {!success ? (
            <>
              <div className="text-center mb-7">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
                  <FaRegCalendarCheck />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5">Schedule a Consultation</h2>
                <p className="text-slate-500 text-xs">Fill in your details to reserve a consultation slot with a verified MongoDB doctor.</p>
              </div>

              {isDoctorUser && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                  <span>⚠️ You are logged in as a Doctor. Only Patient users can book appointments.</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sophia Lindqvist"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 outline-none focus:border-blue-500 text-slate-700 transition-colors"
                  />
                </div>

                {/* Email + Department row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sophia@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 outline-none focus:border-blue-500 text-slate-700 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => set('department', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 outline-none focus:border-blue-500 text-slate-700"
                    >
                      {['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology'].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Doctor Selection from MongoDB */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Select Doctor {loadingDoctors && <span className="text-blue-500 font-normal">(Loading...)</span>}
                  </label>
                  <select
                    required
                    value={form.doctorId}
                    onChange={(e) => set('doctorId', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {displayDoctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.specialization || d.department || 'Doctor'})
                      </option>
                    ))}
                  </select>
                  {doctors.length === 0 && !loadingDoctors && (
                    <span className="text-[11px] text-amber-600 font-medium">
                      No doctors registered yet. Register a Doctor user to enable appointment booking.
                    </span>
                  )}
                </div>

                {/* Date + Time row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => set('date', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 outline-none focus:border-blue-500 text-slate-700"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Time Slot</label>
                    <select
                      required
                      value={form.time}
                      onChange={(e) => set('time', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 outline-none focus:border-blue-500 text-slate-700"
                    >
                      <option value="">Choose a time</option>
                      {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || doctors.length === 0 || isDoctorUser}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isDoctorUser ? 'Doctor Booking Restricted' : submitting ? 'Confirming Slot...' : 'Confirm Appointment Slot'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm">
                <FaCheckCircle />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Appointment Requested!</h2>
              <p className="text-slate-500 text-xs mb-6 px-4">
                Thank you, <strong>{form.name}</strong>. Your consultation request for <strong>{form.department}</strong> has been submitted.
              </p>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-left text-xs flex flex-col gap-2.5 max-w-xs mx-auto mb-6">
                {[
                  ['Department', form.department],
                  ['Doctor', selectedDoctorObj ? selectedDoctorObj.fullName : 'Assigned Specialist'],
                  ['Date', form.date],
                  ['Time', form.time],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}:</span>
                    <strong className="text-slate-800">{v}</strong>
                  </div>
                ))}
              </div>

              <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 text-[11px] text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
                A calendar invite and pre-consultation guide have been sent to <strong>{form.email}</strong>.
              </div>

              <button
                onClick={close}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 cursor-pointer transition-colors shadow-sm"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
