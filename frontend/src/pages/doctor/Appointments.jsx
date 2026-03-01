import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaFileMedical } from 'react-icons/fa';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? { status: filter } : {};
    appointmentAPI.getAll(params).then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const tabs = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500">Manage patient appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                      {a.patient?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{a.patient?.name}</p>
                      <p className="text-xs text-gray-500">{a.patient?.email} • {a.patient?.phone}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">📅 {format(new Date(a.appointmentDate), 'EEEE, MMMM dd, yyyy')} at {a.timeSlot}</p>
                  <p className="text-sm text-gray-500">📋 {a.reason}</p>
                  {a.symptoms?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">Symptoms: {a.symptoms.join(', ')}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.status} />
                  <div className="flex gap-2">
                    {a.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(a._id, 'approved')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">Approve</button>
                        <button onClick={() => updateStatus(a._id, 'rejected')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium">Reject</button>
                      </>
                    )}
                    {a.status === 'approved' && (
                      <Link to={`/doctor/prescriptions/new/${a._id}`}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-medium flex items-center gap-1">
                        <FaFileMedical /> Write Prescription
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!appointments.length && (
            <div className="text-center py-16 text-gray-400">No appointments found</div>
          )}
        </div>
      )}
    </Layout>
  );
}