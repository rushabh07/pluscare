import { blogPosts } from '../data/homeData';
import { FaArrowRight } from 'react-icons/fa';

export default function BlogSection() {
  return (
    <section id="blog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold text-blue-800 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Health Insights</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Latest Clinical Research & Tips</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">Peer-reviewed articles covering digital health advances and evidence-based wellness protocols.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {blogPosts.map((p, i) => (
            <article key={i} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{p.category}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mb-3">
                  <span>{p.date}</span><span className="w-1 h-1 bg-slate-300 rounded-full" /><span>{p.readTime} read</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2.5 leading-snug group-hover:text-blue-600 transition-colors">{p.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-5">{p.desc}</p>
                <a href="#blog" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 mt-auto group/link">
                  Read Article <FaArrowRight className="text-[9px] group-hover/link:translate-x-1 transition-transform" />
                </a>

              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
