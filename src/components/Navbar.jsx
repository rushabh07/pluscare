import { useState, useEffect } from 'react';
import { FaHeartbeat, FaLock, FaUserPlus } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from "react-router-dom";

const links = [
  { label: 'Home', id: 'hero' },
  { label: 'About', id: 'why' },
  { label: 'Services', id: 'services' },
  { label: 'Departments', id: 'departments' },
  { label: 'Doctors', id: 'doctors' },
  { label: 'AI Features', id: 'ai' },
  { label: 'Contact', id: 'footer' },
];

export default function Navbar({ onBook }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      setUser(userInfo);
    }
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // After navigating to "/", scroll to the target section once the page renders
  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash && location.pathname === '/') {
      // Small delay to let the homepage sections render
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const go = (id) => {
    setOpen(false);
    if (id === 'hero') {
      // "Home" should always navigate to "/" and scroll to top
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
      return;
    }

    // If already on homepage, just scroll to the section
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to homepage with hash, the useEffect above will handle scrolling
      navigate(`/#${id}`);
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/60' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => go('hero')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <FaHeartbeat className="text-lg" />
          </div>
          <span className="font-extrabold text-xl text-gray-500">Plus<span className="text-blue-600">Care</span></span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          <button onClick={() => go('hero')} className="text-[14px] font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            Home
          </button>
          <Link to="/services" className="text-[14px] font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            Services
          </Link>
          <button onClick={() => go('why')} className="text-[14px] font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            About
          </button>
          <button onClick={() => go('departments')} className="text-[14px] font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            Departments
          </button>
          <button onClick={() => go('doctors')} className="text-[14px] font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            Doctors
          </button>
          <button onClick={() => go('ai')} className="text-[14px] font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
            AI Features
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user?.token ? (
            <>
              <Link to={user.role === 'Admin' ? '/admin/dashboard' : `/${user.role.toLowerCase()}/dashboard`}
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors">
                Dashboard
              </Link>
              <button onClick={() => { localStorage.removeItem('userInfo'); setUser(null); }}
                className="px-4 py-2 border border-red-300 rounded-xl text-red-600 font-bold text-sm hover:bg-red-50 transition-all flex items-center gap-1.5 cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="flex items-center gap-1.5 text-slate-900 hover:text-blue-600 font-bold text-sm transition-colors">
                <FaLock className="text-xs" />
                Login
              </Link>

              <Link to="/register"
                className="px-4 py-2 border border-blue-300 rounded-xl text-blue-600 font-bold text-sm hover:bg-blue-50 transition-all flex items-center gap-1.5">
                <FaUserPlus className="text-xs" />
                Register
              </Link>
            </>
          )}
          <button onClick={onBook} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all cursor-pointer">
            Book Appointment
          </button>
        </div>

        {/* Hamburger */}
        <button className="lg:hidden flex flex-col gap-1.5 cursor-pointer p-1" onClick={() => setOpen(o => !o)}>
          <span className={`block h-0.5 w-6 bg-slate-800 rounded transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-6 bg-slate-800 rounded transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-slate-800 rounded transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-lg px-5 py-4 flex flex-col gap-1">
          <button onClick={() => go('hero')}
            className="text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 transition-colors cursor-pointer">
            Home
          </button>
          <Link to="/services" onClick={() => setOpen(false)}
            className="text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 transition-colors">
            Services
          </Link>
          <button onClick={() => go('why')}
            className="text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 transition-colors cursor-pointer">
            About
          </button>
          <button onClick={() => go('departments')}
            className="text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 transition-colors cursor-pointer">
            Departments
          </button>
          <button onClick={() => go('doctors')}
            className="text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 transition-colors cursor-pointer">
            Doctors
          </button>
          <button onClick={() => go('ai')}
            className="text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 transition-colors cursor-pointer">
            AI Features
          </button>
          <div className="flex flex-col gap-3 mt-3">
            {user?.token ? (
              <>
                <Link to={user.role === 'Admin' ? '/admin/dashboard' : `/${user.role.toLowerCase()}/dashboard`}
                  className="w-full text-center py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-50">
                  Dashboard
                </Link>
                <button onClick={() => { localStorage.removeItem('userInfo'); setUser(null); setOpen(false); }}
                  className="w-full py-2.5 border border-red-300 rounded-xl text-red-600 font-bold text-sm cursor-pointer hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full text-center py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-50">Login</Link>
                <Link to="/register" className="w-full text-center py-2.5 border border-blue-300 rounded-xl text-blue-600 font-bold text-sm cursor-pointer hover:bg-blue-50">Register</Link>
              </>
            )}
            <button onClick={() => { onBook(); setOpen(false); }} className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">Book Appointment</button>
          </div>
        </div>
      )}
    </header>
  );
}

