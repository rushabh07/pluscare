import { FaHeartbeat, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const quickLinks = [
  { label: 'Home', id: 'hero' },
  { label: 'Services', id: 'services' },
  { label: 'Departments', id: 'departments' },
  { label: 'Doctors', id: 'doctors' },
  { label: 'Packages', id: 'pricing' },
];

const specialties = [
  { label: 'AI Health Assist', id: 'ai' },
  { label: 'Telehealth Hub', id: 'services' },
  { label: 'Unified EHR', id: 'services' },
  { label: 'Clinical Resources', id: 'blog' },
];

const socials = [
  { Icon: FaFacebookF, label: 'Facebook' },
  { Icon: FaTwitter, label: 'Twitter' },
  { Icon: FaInstagram, label: 'Instagram' },
  { Icon: FaLinkedinIn, label: 'LinkedIn' },
];

export default function Footer() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer id="footer" className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-5 pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

        {/* Brand */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-5">
            <FaHeartbeat className="text-2xl text-blue-500" />
            <span className="font-extrabold text-xl text-white">Plus<span className="text-blue-500">Care</span></span>
          </div>
          <p className="text-xs leading-relaxed mb-6">PlusCare is an enterprise health tech provider offering clinic management, secure EHR systems, and direct patient-to-practitioner coordination.</p>
          <div className="flex gap-3">
            {socials.map(({ Icon, label }) => (
              <a key={label} href="#social" aria-label={label} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 flex items-center justify-center text-xs transition-all">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {quickLinks.map(l => (
              <li key={l.id}><button onClick={() => go(l.id)} className="text-xs hover:text-white transition-colors cursor-pointer">{l.label}</button></li>
            ))}
          </ul>
        </div>

        {/* Specialties */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Specialties</h4>
          <ul className="flex flex-col gap-3">
            {specialties.map(l => (
              <li key={l.label}><button onClick={() => go(l.id)} className="text-xs hover:text-white transition-colors cursor-pointer">{l.label}</button></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="lg:col-span-4">
          <h4 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Stay Connected</h4>
          <p className="text-xs leading-relaxed mb-5">Subscribe for vetted medical tips, platform updates, and seasonal wellness advice from our clinical team.</p>
          <form onSubmit={e => e.preventDefault()} className="flex gap-2">
            <input type="email" placeholder="Enter your email" className="flex-1 bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors" />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0">Join</button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <span>&copy; {new Date().getFullYear()} PlusCare Systems Inc. All rights reserved.</span>
          <div className="flex gap-5 flex-wrap justify-center">
            {['Privacy Policy', 'Terms of Service', 'HIPAA Standards', 'System Security'].map(l => (
              <a key={l} href="#legal" className="hover:text-slate-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
