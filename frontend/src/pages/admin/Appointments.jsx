import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    appointmentAPI.getAll(params).then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const filtered = appointments.filter(a =>
    a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500">Manage all hospital appointments</p>
      </div>

      <div className="card mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search by patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Doctor</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date & Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Reason</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{a.patient?.name}</td>
                  <td className="py-3 px-4 text-gray-500">Dr. {a.doctor?.name}<br /><span className="text-xs text-blue-500">{a.doctorProfile?.specialization}</span></td>
                  <td className="py-3 px-4 text-gray-500">{format(new Date(a.appointmentDate), 'MMM dd, yyyy')}<br /><span className="text-xs">{a.timeSlot}</span></td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{a.reason}</td>
                  <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                  <td className="py-3 px-4">
                    {a.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(a._id, 'approved')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">Approve</button>
                        <button onClick={() => updateStatus(a._id, 'rejected')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200">Reject</button>
                      </div>
                    )}
                    {a.status === 'approved' && (
                      <button onClick={() => updateStatus(a._id, 'completed')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200">Mark Complete</button>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}