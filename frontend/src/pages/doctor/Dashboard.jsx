import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/Statcard';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { appointmentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getAll().then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const approved = appointments.filter(a => a.status === 'approved').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const today = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <p className="text-gray-500">Here's your appointment overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Appointments" value={appointments.length} icon={FaCalendarAlt} color="blue" />
        <StatCard title="Pending" value={pending} icon={FaClock} color="yellow" />
        <StatCard title="Approved" value={approved} icon={FaCheckCircle} color="green" />
        <StatCard title="Today" value={today.length} icon={FaUsers} color="purple" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Today's Appointments</h2>
              <Link to="/doctor/appointments" className="text-blue-600 text-sm hover:underline">View all</Link>
            </div>
            {today.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {today.map(a => (
                  <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{a.patient?.name}</p>
                      <p className="text-xs text-gray-500">{a.timeSlot} • {a.reason}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{pending} pending</span>
            </div>
            {appointments.filter(a => a.status === 'pending').slice(0, 5).map(a => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-2">
                <div>
                  <p className="font-medium text-sm">{a.patient?.name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(a.appointmentDate), 'MMM dd')} at {a.timeSlot}</p>
                </div>
                <Link to="/doctor/appointments" className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">Review</Link>
              </div>
            ))}
            {pending === 0 && <p className="text-center text-gray-400 py-8">No pending requests</p>}
          </div>
        </div>
      )}
    </Layout>
  );
}