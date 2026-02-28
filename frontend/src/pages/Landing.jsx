import React from 'react';
import { Link } from 'react-router-dom';
import { FaHospital, FaUserMd, FaCalendarCheck, FaRobot, FaShieldAlt, FaChartBar, FaFileMedical } from 'react-icons/fa';

export default function Landing() {
  const features = [
    { icon: FaUserMd, title: 'Expert Doctors', desc: 'Browse and book appointments with verified specialists across all departments.' },
    { icon: FaCalendarCheck, title: 'Easy Scheduling', desc: 'Book, manage, and track your appointments seamlessly online.' },
    { icon: FaRobot, title: 'AI-Powered Tools', desc: 'Symptom checker, health chatbot, and prescription explanations powered by AI.' },
    { icon: FaFileMedical, title: 'Medical Records', desc: 'Access and download your complete medical history anytime.', },
    { icon: FaShieldAlt, title: 'Secure & Private', desc: 'Your health data is protected with enterprise-grade security.' },
    { icon: FaChartBar, title: 'Analytics Dashboard', desc: 'Real-time analytics for admins to monitor hospital operations.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><FaHospital /></div>
          <span className="text-xl font-bold text-gray-900">MediCare</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center px-8 py-20">
        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">AI-Powered Hospital Management</span>
        <h1 className="mt-6 text-5xl font-bold text-gray-900 leading-tight">
          Healthcare Made <span className="text-blue-600">Simple & Smart</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          Complete hospital management with AI-powered symptom checking, instant appointments, and intelligent prescriptions.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-8 py-3">Start Free Today</Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3">Login →</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:shadow-md transition-shadow">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-blue-600 py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Built for Everyone</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'Patients', desc: 'Book appointments, view history, chat with AI assistant' },
              { role: 'Doctors', desc: 'Manage appointments, write prescriptions, view patient records' },
              { role: 'Admins', desc: 'Full hospital control with analytics and staff management' }
            ].map(({ role, desc }) => (
              <div key={role} className="bg-white bg-opacity-10 rounded-xl p-6 text-white">
                <h3 className="font-bold text-xl mb-2">{role}</h3>
                <p className="text-blue-100 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        © 2024 MediCare Hospital Management System. Built with MERN Stack + AI.
      </footer>
    </div>
  );
}