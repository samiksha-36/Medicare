import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { doctorAPI, appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaSearch } from 'react-icons/fa';

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ appointmentDate: '', timeSlot: '', reason: '', symptoms: '', type: 'in-person' });
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    doctorAPI.getAll().then(res => setDoctors(res.data.doctors)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.timeSlot || !form.reason) return toast.error('Please fill all required fields');
    setBooking(true);
    try {
      await appointmentAPI.book({
        doctor: selected.user._id,
        ...form,
        symptoms: form.symptoms ? form.symptoms.split(',').map(s => s.trim()) : []
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500">Step {step} of 2</p>
        {/* Progress */}
        <div className="flex gap-2 mt-3">
          <div className={`h-1.5 flex-1 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="card mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-10" placeholder="Search by doctor name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(doc => (
                <div key={doc._id}
                  onClick={() => { setSelected(doc); setStep(2); }}
                  className={`card cursor-pointer hover:shadow-lg transition-all hover:border-blue-300 hover:-translate-y-1 ${selected?._id === doc._id ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dr. {doc.user?.name}</h3>
                      <p className="text-sm text-blue-600">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>🏥 {doc.hospital || 'City Hospital'}</p>
                    <p>💼 {doc.experience} years exp.</p>
                    <p>⭐ {doc.rating || 4.5}/5 rating</p>
                    <p className="font-medium text-gray-900">₹{doc.consultationFee} fee</p>
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <div className="col-span-3 text-center py-16 text-gray-400">No doctors found</div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && selected && (
        <div className="max-w-2xl">
          <div className="card mb-4 bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center"><FaUserMd className="text-blue-700 text-xl" /></div>
              <div>
                <h3 className="font-semibold">Dr. {selected.user?.name}</h3>
                <p className="text-sm text-blue-600">{selected.specialization} • ₹{selected.consultationFee}</p>
              </div>
              <button onClick={() => { setSelected(null); setStep(1); }} className="ml-auto text-sm text-blue-600 hover:underline">Change</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
              <input type="date" className="input-field" min={new Date().toISOString().split('T')[0]} value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button" onClick={() => setForm({ ...form, timeSlot: slot })}
                    className={`py-2 px-3 rounded-lg text-sm border transition-colors ${form.timeSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:border-blue-300'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="in-person">In-Person</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
              <textarea className="input-field" rows={3} placeholder="Briefly describe your reason..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma separated)</label>
              <input className="input-field" placeholder="e.g., headache, fever, cough" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button type="submit" disabled={booking} className="btn-primary flex-1">{booking ? 'Booking...' : 'Confirm Booking'}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}