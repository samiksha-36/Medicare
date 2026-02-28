import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { doctorAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserMd } from 'react-icons/fa';

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 'Pediatrician', 'Psychiatrist', 'General Physician', 'ENT Specialist', 'Gynecologist', 'Oncologist'];

const emptyForm = { name: '', email: '', password: '', phone: '', specialization: '', experience: '', consultationFee: '', bio: '', hospital: '' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    doctorAPI.getAll().then(res => setDoctors(res.data.doctors)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = doctors.filter(d =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (doc) => {
    setEditing(doc._id);
    setForm({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      password: '',
      phone: doc.user?.phone || '',
      specialization: doc.specialization || '',
      experience: doc.experience || '',
      consultationFee: doc.consultationFee || '',
      bio: doc.bio || '',
      hospital: doc.hospital || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editing && !form.password) || !form.specialization) {
      return toast.error('Please fill required fields');
    }
    setSaving(true);
    try {
      if (editing) {
        await doctorAPI.update(editing, form);
        toast.success('Doctor updated');
      } else {
        await doctorAPI.create(form);
        toast.success('Doctor added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try {
      await doctorAPI.delete(id);
      toast.success('Doctor removed');
      load();
    } catch (err) {
      toast.error('Failed to remove doctor');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500">Manage hospital doctors</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserMd className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {doc.user?.name}</h3>
                    <p className="text-sm text-blue-600">{doc.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(doc)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                  <button onClick={() => handleDelete(doc._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>📧 {doc.user?.email}</p>
                <p>🏥 {doc.hospital || 'Not specified'}</p>
                <p>💼 {doc.experience} years experience</p>
                <p>💰 ₹{doc.consultationFee} consultation</p>
                <p>{doc.isVerified ? '✅ Verified' : '⏳ Pending verification'}</p>
              </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editing ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input type="password" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <select className="input-field" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                    <option value="">Select...</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input type="number" className="input-field" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                  <input type="number" className="input-field" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                  <input className="input-field" value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea className="input-field" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}