import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? { status: filter } : {};
    appointmentAPI.getAll(params).then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const tabs = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500">Track your medical appointments</p>
        </div>
        <Link to="/patient/book" className="btn-primary text-sm">+ Book New</Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {appointments.map(a => (
            <div key={a._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                      Dr
                    </div>
                    <div>
                      <p className="font-semibold">Dr. {a.doctor?.name}</p>
                      <p className="text-xs text-blue-500">{a.doctorProfile?.specialization}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">📅 {format(new Date(a.appointmentDate), 'EEEE, MMMM dd, yyyy')} at {a.timeSlot}</p>
                  <p className="text-sm text-gray-500 mt-1">📋 {a.reason}</p>
                  {a.notes && <p className="text-sm text-gray-400 mt-1">📝 {a.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.status} />
                  {a.fee && <p className="text-sm font-medium text-gray-900">₹{a.fee}</p>}
                  {['pending', 'approved'].includes(a.status) && (
                    <button onClick={() => cancel(a._id)} className="text-xs text-red-500 hover:underline">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!appointments.length && (
            <div className="text-center py-16 text-gray-400">
              <FaCalendarAlt className="text-5xl mx-auto mb-4 opacity-30" />
              <p className="mb-4">No appointments found</p>
              <Link to="/patient/book" className="btn-primary text-sm">Book Your First Appointment</Link>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}