import { useState } from 'react';
import { packages } from '../data/homeData';
import { FiCheck } from 'react-icons/fi';

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Health Packages</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Integrated Primary Care Plans</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-7">Direct care, 24/7 hotlines, and smart monitoring. Save 20% on annual billing.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full">
            <span className={`text-xs font-bold transition-colors ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button onClick={() => setAnnual(a => !a)} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${annual ? 'bg-blue-600' : 'bg-slate-200'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual <span className="bg-teal-50 text-teal-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 max-w-6xl mx-auto items-stretch">
          {packages.map((pkg, i) => {
            const price = annual ? pkg.priceAnnual : pkg.priceMonthly;
            return (
              <div key={i} className={`rounded-2xl p-8 flex flex-col relative border transition-all ${pkg.popular ? 'bg-white border-blue-500 border-2 shadow-2xl shadow-blue-100 lg:scale-[1.03]' : 'bg-white border-slate-200/80 hover:shadow-lg'}`}>
                {pkg.popular && <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>}
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{pkg.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed min-h-[48px] mb-6">{pkg.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-xl font-bold text-slate-900">₹</span>
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                    {Number(price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">/ month</span>
                </div>
                <div className="h-px bg-slate-100 mb-6" />
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {pkg.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-xs ${f.includes('plus:') ? 'font-bold text-slate-900 mt-1' : 'text-slate-600'}`}>
                      {!f.includes('plus:') && <FiCheck className="text-teal-500 mt-0.5 shrink-0 text-sm" />}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${pkg.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg shadow-blue-200' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  {pkg.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
