import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  FiGrid, FiUsers, FiUser, FiCalendar, FiLayers,
  FiDollarSign, FiFileText, FiBell, FiBarChart2,
  FiPieChart, FiSettings, FiLogOut, FiMenu, FiX,
  FiActivity, FiChevronRight
} from "react-icons/fi";

const navItems = [
  { to: "/admin/dashboard",       label: "Dashboard",       icon: <FiGrid /> },
  { to: "/admin/services",        label: "Services Module", icon: <FiLayers /> },
  { to: "/admin/doctors",         label: "Doctors",         icon: <FiUsers /> },
  { to: "/admin/patients",        label: "Patients",        icon: <FiUser /> },
  { to: "/admin/appointments",    label: "Appointments",    icon: <FiCalendar /> },
  { to: "/admin/departments",     label: "Departments",     icon: <FiLayers /> },
  { to: "/admin/billing",         label: "Billing",         icon: <FiDollarSign /> },
  { to: "/admin/medical-records", label: "Medical Records", icon: <FiFileText /> },
  { to: "/admin/notifications",   label: "Notifications",   icon: <FiBell /> },
  { to: "/admin/reports",         label: "Reports",         icon: <FiBarChart2 /> },
  { to: "/admin/analytics",       label: "Analytics",       icon: <FiPieChart /> },
  { to: "/admin/settings",        label: "Settings",        icon: <FiSettings /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } flex-shrink-0 transition-all duration-300 flex flex-col bg-gray-900 border-r border-gray-800 shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FiActivity className="text-white text-lg" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="font-bold text-white text-lg leading-none">PlusCare</span>
              <p className="text-xs text-blue-400 font-medium">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <FiChevronRight className="opacity-0 group-hover:opacity-60 text-sm" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-800 p-3">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user.fullName?.charAt(0) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.fullName || "Admin"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email || ""}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <FiLogOut className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            {sidebarOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>

          <div className="flex-1" />

          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <FiBell className="text-lg" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
            {user.fullName?.charAt(0) || "A"}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
