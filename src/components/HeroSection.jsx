import { FaRegCalendarCheck, FaArrowRight, FaShieldAlt, FaBrain, FaHeartbeat } from 'react-icons/fa';

export default function HeroSection({ onBook }) {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative pt-28 lg:pt-36 pb-0 overflow-hidden min-h-screen flex flex-col">
      {/* BG Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1 w-full py-12">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-800 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            Next-Gen Healthcare SaaS Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 leading-[1.15] mb-5 tracking-tight">
            The Future of<br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Intelligent Healthcare</span><br />
            Starts Here.
          </h1>

          <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
            PlusCare unifies elite clinical expertise with AI diagnostics, remote vitals monitoring, and frictionless scheduling on one HIPAA-compliant platform.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <button onClick={onBook} className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer">
              Book Appointment <FaRegCalendarCheck />
            </button>
            <button onClick={() => go('services')} className="px-7 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 cursor-pointer">
              Explore Services <FaArrowRight className="text-xs" />
            </button>
          </div>

          {/* Mini Vitals Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400">ECG / Heart Rate</span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">Normal</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-1">74 <span className="text-xs font-normal text-slate-400">BPM</span></div>
              <svg viewBox="0 0 100 20" className="w-full h-5">
                <path d="M0,10 L28,10 L32,2 L37,18 L42,10 L47,10 L51,2 L56,18 L60,10 L100,10" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400">SpO₂ Oxygen</span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">Optimal</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-2">99<span className="text-xs font-normal text-slate-400">%</span></div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '99%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Telehealth Mockup */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-blue-100/40 to-teal-100/30 blur-2xl pointer-events-none" />

          <div className="relative w-full max-w-[420px] bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-2xl shadow-blue-100 overflow-hidden animate-[float_6s_ease-in-out_infinite]">
            {/* Window chrome */}
            <div className="bg-slate-100/70 px-4 py-3 flex items-center gap-3 border-b border-slate-200/50">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PlusCare Clinical Suite v3.2</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Patient row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80" alt="patient" className="w-9 h-9 rounded-full object-cover border-2 border-blue-500" />
                  <div><p className="text-xs font-bold text-slate-800">Sophia Lindqvist</p><p className="text-[10px] text-slate-400">ID: PC-89021</p></div>
                </div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">● Live</span>
              </div>

              {/* Video */}
              <div className="relative h-44 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400" alt="doctor" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between">
                  <span className="text-[10px] font-bold bg-slate-900/70 text-white px-2 py-0.5 rounded-lg backdrop-blur-sm">Dr. Adrian Thorne</span>
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />REC</span>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {['🎙️', '📹', '📞'].map((e, i) => (
                    <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer backdrop-blur-sm transition-colors ${i === 2 ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/40'}`}>{e}</span>
                  ))}
                </div>
              </div>

              {/* AI Sync */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-800 uppercase mb-1"><FaBrain className="text-xs" /> AI Co-Pilot Sync</div>
                <p className="text-[11px] text-blue-900 italic leading-relaxed">"Cardiac baseline 74 BPM — vitals stable. Telemetry streaming to patient file..."</p>
              </div>
            </div>
          </div>

          {/* Floaters */}
          <div className="absolute bottom-8 -left-4 bg-white rounded-2xl p-3 shadow-lg border border-slate-100 flex items-center gap-2.5 animate-[float_5s_ease-in-out_infinite_alternate]">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs"><FaShieldAlt /></div>
            <div><p className="text-[11px] font-extrabold text-slate-800">HIPAA Secure</p><p className="text-[9px] text-slate-400">256-bit encryption</p></div>
          </div>
          <div className="absolute top-8 -right-4 bg-white rounded-2xl p-3 shadow-lg border border-slate-100 flex items-center gap-2.5 animate-[float_7s_ease-in-out_infinite]">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs"><FaHeartbeat /></div>
            <div><p className="text-[11px] font-extrabold text-slate-800">99.4% Accuracy</p><p className="text-[9px] text-slate-400">AI screening</p></div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="w-full border-t border-slate-200/80 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-5 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['99.8%','Patient Satisfaction'],['500+','Certified Doctors'],['15+','Departments'],['24/7','AI Support']].map(([v,l]) => (
            <div key={l}><div className="text-3xl font-extrabold text-blue-600 mb-1">{v}</div><div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{l}</div></div>
          ))}
        </div>
      </div>
    </section>
  );
}
