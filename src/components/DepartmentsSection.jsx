import { departments } from '../data/homeData';

export default function DepartmentsSection({ onBook }) {
  return (
    <section id="departments" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Clinical Specialties</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Specialized Medical Divisions</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">Browse our key clinical divisions managed by award-winning specialist leads and fully certified staff.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {departments.map((d) => (
            <div key={d.id} className="group bg-white border border-slate-100 hover:border-blue-100 hover:shadow-lg rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-400/6 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
              <div className="flex justify-between items-center mb-5">
                <span className="text-3xl">{d.icon}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{d.code}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{d.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1">{d.desc}</p>
              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-400">{d.doctors} Specialists</span>
                <button onClick={() => onBook(d.name)} className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all cursor-pointer">
                  Book Unit →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
