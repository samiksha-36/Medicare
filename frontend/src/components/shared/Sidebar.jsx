import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome, FaUserMd, FaCalendarAlt, FaUsers, FaFileMedical,
  FaRobot, FaComments, FaFileAlt, FaSignOutAlt, FaUser,
  FaStethoscope, FaBars, FaTimes, FaHospital
} from 'react-icons/fa';
import { useState } from 'react';

const navItems = {
  admin: [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/doctors', icon: FaUserMd, label: 'Doctors' },
    { path: '/admin/patients', icon: FaUsers, label: 'Patients' },
    { path: '/admin/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/ai/chat', icon: FaComments, label: 'AI Chatbot' }
  ],
  doctor: [
    { path: '/doctor', icon: FaHome, label: 'Dashboard' },
    { path: '/doctor/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/doctor/prescriptions', icon: FaFileMedical, label: 'Prescriptions' },
    { path: '/ai/chat', icon: FaComments, label: 'AI Chatbot' }
  ],
  patient: [
    { path: '/patient', icon: FaHome, label: 'Dashboard' },
    { path: '/patient/doctors', icon: FaUserMd, label: 'Find Doctors' },
    { path: '/patient/book', icon: FaCalendarAlt, label: 'Book Appointment' },
    { path: '/patient/appointments', icon: FaCalendarAlt, label: 'My Appointments' },
    { path: '/patient/history', icon: FaFileMedical, label: 'Medical History' },
    { path: '/ai/symptoms', icon: FaStethoscope, label: 'Symptom Checker' },
    { path: '/ai/chat', icon: FaComments, label: 'AI Chatbot' },
    { path: '/ai/report', icon: FaFileAlt, label: 'Report Summarizer' }
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role] || [];
  const roleBadge = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' };
  const roleColor = { admin: 'bg-purple-100 text-purple-700', doctor: 'bg-blue-100 text-blue-700', patient: 'bg-green-100 text-green-700' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <FaHospital className="text-xl" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-lg leading-tight">MediCare</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[user?.role]}`}>
            {roleBadge[user?.role]}
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUser className="text-blue-600" />
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={active ? 'text-white' : 'text-gray-400'} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <FaUser className="text-gray-400" /> Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-xl transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
}