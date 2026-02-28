import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { doctorAPI } from '../../utils/api';
import { FaUserMd, FaSearch, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SPECIALIZATIONS = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 'Pediatrician', 'Psychiatrist', 'General Physician', 'ENT Specialist', 'Gynecologist'];

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');

  useEffect(() => {
    doctorAPI.getAll().then(res => setDoctors(res.data.doctors)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const matchSearch = d.user?.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = spec === 'All' || d.specialization === spec;
    return matchSearch && matchSpec;
  });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
        <p className="text-gray-500">Browse our specialists</p>
      </div>

      {/* Search & Filter */}
      <div className="card mb-6 flex flex-col gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map(s => (
            <button key={s} onClick={() => setSpec(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${spec === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc._id} className="card hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <FaUserMd className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Dr. {doc.user?.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-xs text-gray-500">{doc.rating || 4.5}</span>
                  </div>
                </div>
              </div>

              {doc.bio && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{doc.bio}</p>}

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-bold text-gray-900">{doc.experience}</p>
                  <p className="text-xs text-gray-500">Years Exp.</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="font-bold text-blue-700">₹{doc.consultationFee}</p>
                  <p className="text-xs text-gray-500">Fee</p>
                </div>
              </div>

              {doc.hospital && <p className="text-xs text-gray-400 mb-3">🏥 {doc.hospital}</p>}

              <Link to="/patient/book" className="btn-primary w-full text-center text-sm block">Book Appointment</Link>
            </div>
          ))}
          {!filtered.length && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <FaUserMd className="text-5xl mx-auto mb-4 opacity-30" />
              <p>No doctors found</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}