import { FaPhoneAlt } from 'react-icons/fa';

export default function EmergencyBanner() {
  return (
    <section className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-t-4 border-red-500 text-white">
      <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="relative w-14 h-14 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl shrink-0">
            <span className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-30" />
            <FaPhoneAlt />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold mb-1">Emergency Dispatch Available 24 / 7</h2>
            <p className="text-red-300/80 text-xs md:text-sm max-w-lg leading-relaxed">Experiencing acute chest pain, sudden loss of motor control, or severe distress? Contact our emergency line immediately.</p>
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-end shrink-0">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Emergency Hot-Line</span>
          <a href="tel:18007587273" className="text-2xl md:text-3xl font-black text-red-400 hover:text-red-300 transition-colors">1-800-758-7273</a>
        </div>
      </div>
    </section>
  );
}
