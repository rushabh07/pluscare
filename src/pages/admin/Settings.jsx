import React, { useEffect, useState } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiShield } from "react-icons/fi";
import api, { authService } from "../../services/api";

export default function Settings() {
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "", gender: "Male" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState({ text: "", error: false });
  const [passMsg, setPassMsg] = useState({ text: "", error: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        const u = res.data;
        setProfile({ fullName: u.fullName, email: u.email, phone: u.phone, gender: u.gender });
      } catch (err) {
        setProfileMsg({ text: "Failed to load profile.", error: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: "", error: false });
    try {
      const res = await authService.updateProfile(profile);
      const updatedUser = res.data;
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem("userInfo", JSON.stringify({ ...stored, ...updatedUser }));
      setProfileMsg({ text: "Profile updated successfully.", error: false });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || "Update failed.", error: true });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg({ text: "", error: false });
    if (passwords.newPass !== passwords.confirm) {
      setPassMsg({ text: "New passwords do not match.", error: true });
      return;
    }
    try {
      await authService.updateProfile({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPassMsg({ text: "Password changed successfully.", error: false });
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || "Password change failed.", error: true });
    }
  };

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your admin account preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md">
            {user.fullName?.charAt(0) || "A"}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">{user.fullName || "Admin"}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <FiShield className="text-blue-600 text-xs" />
              <span className="text-xs text-blue-700 font-bold">Administrator</span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-medium text-slate-600 mb-4 flex items-center gap-2">
          <FiUser /> Profile Information
        </h3>

        {profileMsg.text && (
          <div className={`px-4 py-3 rounded-xl text-sm mb-4 ${profileMsg.error ? "bg-red-50 text-red-800 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
            {profileMsg.text}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-200">
              <FiSave /> Save Profile
            </button>
          </form>
        )}
      </div>

      {/* Password Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-600 mb-4 flex items-center gap-2">
          <FiLock /> Change Password
        </h3>

        {passMsg.text && (
          <div className={`px-4 py-3 rounded-xl text-sm mb-4 ${passMsg.error ? "bg-red-50 text-red-800 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: "current", label: "Current Password" },
            { key: "newPass", label: "New Password" },
            { key: "confirm", label: "Confirm New Password" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500 mb-1.5">{f.label}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="password"
                  required
                  value={passwords[f.key]}
                  onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          ))}
          <button type="submit" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-200">
            <FiShield /> Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
