import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaSearch, FaUser, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { format } from 'date-fns';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    userAPI.getAll({ role: 'patient' }).then(res => setPatients(res.data.users)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id, current) => {
    try {
      await userAPI.updateStatus(id, { isActive: !current });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-500">Manage registered patients</p>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Gender</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Registered</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600 text-xs" />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{p.email}<br /><span className="text-xs">{p.phone || '-'}</span></td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{p.gender || '-'}</td>
                  <td className="py-3 px-4 text-gray-500">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleStatus(p._id, p.isActive)} className={`text-xl ${p.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {p.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}