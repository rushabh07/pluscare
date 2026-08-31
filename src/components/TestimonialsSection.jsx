import { useState, useEffect } from 'react';
import { testimonials } from '../data/homeData';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const n = testimonials.length;

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % n), 7000);
    return () => clearInterval(t);
  }, [n]);

  const prev = () => setActive(p => (p - 1 + n) % n);
  const next = () => setActive(p => (p + 1) % n);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-5 text-center relative">
        <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Patient Stories</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-14">Real Outcomes from Real Patients</h2>

        <div className="relative min-h-[220px] flex items-center justify-center">
          <FaQuoteLeft className="absolute -top-2 left-6 text-6xl text-slate-100 pointer-events-none" />
          {testimonials.map((t, i) => (
            <div key={i} className={`absolute w-full transition-all duration-500 ${i === active ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
              <p className="text-lg md:text-xl font-medium text-slate-700 leading-relaxed max-w-2xl mx-auto mb-5">"{t.quote}"</p>
              <div className="flex gap-1 justify-center mb-4">
                {Array.from({ length: t.rating }).map((_, j) => <FaStar key={j} className="text-amber-400 text-sm" />)}
              </div>
              <h4 className="font-bold text-slate-900">{t.author}</h4>
              <p className="text-xs text-slate-400 font-semibold">{t.role} — {t.location}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-12 mt-16">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-sm">
            <FaChevronLeft className="text-xs" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all cursor-pointer ${i === active ? 'bg-blue-600 w-6' : 'bg-slate-200 w-2 hover:bg-slate-300'}`} />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-sm">
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>
    </section>
  );
}
