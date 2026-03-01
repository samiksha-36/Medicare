import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { prescriptionAPI } from '../../utils/api';
import { format } from 'date-fns';
import { FaFileMedical } from 'react-icons/fa';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getAll().then(res => setPrescriptions(res.data.prescriptions)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-500">Prescriptions you've written</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl"><FaFileMedical className="text-blue-600 text-xl" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.patient?.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{p.diagnosis}</p>
                    <p className="text-xs text-gray-500 mt-1">{format(new Date(p.createdAt), 'MMMM dd, yyyy')}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.medicines.map((m, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{m.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {p.followUpDate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Follow-up</p>
                    <p className="text-sm font-medium text-orange-600">{format(new Date(p.followUpDate), 'MMM dd')}</p>
                  </div>
                )}
              </div>
              {p.aiExplanation && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-purple-700 mb-1">🤖 AI Explanation for Patient</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{p.aiExplanation}</p>
                </div>
              )}
            </div>
          ))}
          {!prescriptions.length && (
            <div className="text-center py-16 text-gray-400"><FaFileMedical className="text-5xl mx-auto mb-4 opacity-30" /><p>No prescriptions yet</p></div>
          )}
        </div>
      )}
    </Layout>
  );
}