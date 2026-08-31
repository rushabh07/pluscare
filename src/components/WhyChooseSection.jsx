import { FiAward, FiClock } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';

const benefits = [
  { icon: <FiAward className="text-lg" />, title: 'Board-Certified Specialists', desc: 'Every practitioner is thoroughly vetted, licensed, and undergoes regular peer-review assessments.' },
  { icon: <FiClock className="text-lg" />, title: 'Zero Wait-Time Consults', desc: 'Our smart scheduler updates queues dynamically to guarantee consultations start on time, every time.' },
  { icon: <FaShieldAlt className="text-lg" />, title: 'Military-Grade Encryption', desc: 'HIPAA & GDPR compliant architecture with double-layer end-to-end data security on all records.' },
];

export default function WhyChooseSection() {
  return (
    <section id="why" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="relative flex justify-center">
          <div className="absolute -top-6 -left-4 bg-blue-600 text-white px-5 py-4 rounded-2xl shadow-xl flex flex-col items-center z-10 animate-[float_4s_ease-in-out_infinite_alternate]">
            <span className="text-3xl font-extrabold leading-none">15+</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90 text-center mt-1">Years of<br/>Clinical Care</span>
          </div>
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=520" alt="PlusCare clinical team" className="w-full max-w-[440px] rounded-2xl shadow-2xl shadow-slate-200 object-cover" />
        </div>

        {/* Content */}
        <div>
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">The PlusCare Standard</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5">Why Leading Patients & Practitioners Choose PlusCare</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">We eliminate administrative delays so physicians spend fewer minutes at terminals and more time delivering face-to-face clinical excellence.</p>

          <div className="flex flex-col gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm">{b.icon}</div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{b.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
