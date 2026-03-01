import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/Statcard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import { FaUserMd, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getAnalytics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const { stats, recentAppointments, monthlyData } = data || {};

  const barData = {
    labels: monthlyData?.map(d => MONTHS[d._id.month - 1]) || [],
    datasets: [{
      label: 'Appointments',
      data: monthlyData?.map(d => d.count) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6
    }]
  };

  const doughnutData = {
    labels: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    datasets: [{
      data: [stats?.pendingCount, stats?.approvedCount, stats?.completedCount, stats?.cancelledCount],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
      borderWidth: 0
    }]
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Hospital overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon={FaUserMd} color="blue" />
        <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon={FaUsers} color="green" />
        <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} icon={FaCalendarAlt} color="purple" />
        <StatCard title="Completed" value={stats?.completedCount || 0} icon={FaCheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <StatCard title="Pending" value={stats?.pendingCount || 0} icon={FaClock} color="yellow" />
        <StatCard title="Cancelled" value={stats?.cancelledCount || 0} icon={FaTimesCircle} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Appointments</h2>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Patient</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Doctor</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments?.map(appt => (
                <tr key={appt._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{appt.patient?.name}</td>
                  <td className="py-2 px-3 text-gray-500">Dr. {appt.doctor?.name}</td>
                  <td className="py-2 px-3 text-gray-500">{format(new Date(appt.appointmentDate), 'MMM dd, yyyy')}</td>
                  <td className="py-2 px-3"><StatusBadge status={appt.status} /></td>
                </tr>
              ))}
              {!recentAppointments?.length && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No appointments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}