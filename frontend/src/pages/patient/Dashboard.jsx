import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { appointmentAPI, prescriptionAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaCheckCircle, FaFileMedical, FaStethoscope } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentAPI.getAll(), prescriptionAPI.getAll()])
      .then(([a, p]) => { setAppointments(a.data.appointments); setPrescriptions(p.data.prescriptions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500">Your health dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Appointments" value={appointments.length} icon={FaCalendarAlt} color="blue" />
        <StatCard title="Upcoming" value={upcoming.length} icon={FaCalendarAlt} color="yellow" />
        <StatCard title="Completed" value={completed.length} icon={FaCheckCircle} color="green" />
        <StatCard title="Prescriptions" value={prescriptions.length} icon={FaFileMedical} color="purple" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-blue-600 text-sm hover:underline">View all</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 mb-3">No upcoming appointments</p>
                <Link to="/patient/book" className="btn-primary text-sm">Book Now</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map(a => (
                  <div key={a._id} className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Dr. {a.doctor?.name}</p>
                      <p className="text-xs text-gray-500">{format(new Date(a.appointmentDate), 'MMM dd, yyyy')} at {a.timeSlot}</p>
                      <p className="text-xs text-gray-400">{a.reason}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent prescriptions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Prescriptions</h2>
              <Link to="/patient/history" className="text-blue-600 text-sm hover:underline">View all</Link>
            </div>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FaFileMedical className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No prescriptions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 4).map(p => (
                  <div key={p._id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{p.diagnosis}</p>
                    <p className="text-xs text-gray-500">Dr. {p.doctor?.name} • {format(new Date(p.createdAt), 'MMM dd, yyyy')}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.medicines.slice(0, 3).map((m, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{m.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { to: '/patient/book', icon: FaCalendarAlt, label: 'Book Appointment', color: 'blue' },
                { to: '/patient/doctors', icon: FaStethoscope, label: 'Find Doctors', color: 'green' },
                { to: '/ai/symptoms', icon: FaStethoscope, label: 'Symptom Checker', color: 'purple' },
                { to: '/ai/chat', icon: FaStethoscope, label: 'AI Chatbot', color: 'yellow' }
              ].map(({ to, icon: Icon, label, color }) => (
                <Link key={to} to={to} className={`p-4 rounded-xl text-center hover:shadow-md transition-shadow bg-${color}-50 hover:bg-${color}-100`}>
                  <Icon className={`text-${color}-600 text-2xl mx-auto mb-2`} />
                  <p className={`text-${color}-700 text-xs font-medium`}>{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}