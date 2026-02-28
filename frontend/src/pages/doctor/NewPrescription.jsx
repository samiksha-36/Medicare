import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { prescriptionAPI, appointmentAPI, aiAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaRobot } from 'react-icons/fa';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function NewPrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({ diagnosis: '', medicines: [{ ...emptyMed }], labTests: [], followUpDate: '', notes: '' });
  const [labTest, setLabTest] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  useEffect(() => {
    appointmentAPI.getOne(appointmentId).then(res => setAppointment(res.data.appointment)).catch(() => toast.error('Appointment not found'));
  }, [appointmentId]);

  const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, { ...emptyMed }] });
  const removeMedicine = (i) => setForm({ ...form, medicines: form.medicines.filter((_, idx) => idx !== i) });
  const updateMedicine = (i, field, value) => {
    const meds = [...form.medicines];
    meds[i] = { ...meds[i], [field]: value };
    setForm({ ...form, medicines: meds });
  };

  const addLabTest = () => {
    if (labTest.trim()) {
      setForm({ ...form, labTests: [...form.labTests, labTest.trim()] });
      setLabTest('');
    }
  };

  const getAiExplanation = async () => {
    if (!form.diagnosis || form.medicines.every(m => !m.name)) {
      return toast.error('Add diagnosis and at least one medicine first');
    }
    setAiLoading(true);
    try {
      const res = await aiAPI.explainPrescription({ medicines: form.medicines.filter(m => m.name), diagnosis: form.diagnosis });
      setAiExplanation(res.data.explanation);
    } catch { toast.error('AI explanation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis) return toast.error('Diagnosis is required');
    if (form.medicines.filter(m => m.name).length === 0) return toast.error('Add at least one medicine');

    setSaving(true);
    try {
      const payload = {
        appointment: appointmentId,
        patient: appointment.patient._id,
        ...form,
        medicines: form.medicines.filter(m => m.name),
        ...(aiExplanation && { aiExplanation })
      };
      await prescriptionAPI.create(payload);
      toast.success('Prescription created successfully');
      navigate('/doctor/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) return <Layout><div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div></Layout>;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Write Prescription</h1>
        <p className="text-gray-500">For: <strong>{appointment.patient?.name}</strong> • {appointment.timeSlot}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient info */}
        <div className="card bg-blue-50 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">Patient Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Name:</span> <strong>{appointment.patient?.name}</strong></div>
            <div><span className="text-gray-500">Reason:</span> {appointment.reason}</div>
            {appointment.symptoms?.length > 0 && (
              <div className="col-span-2"><span className="text-gray-500">Symptoms:</span> {appointment.symptoms.join(', ')}</div>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
          <textarea className="input-field" rows={2} value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Enter diagnosis..." />
        </div>

        {/* Medicines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Medicines</h3>
            <button type="button" onClick={addMedicine} className="text-sm text-blue-600 flex items-center gap-1 hover:underline"><FaPlus /> Add Medicine</button>
          </div>
          <div className="space-y-4">
            {form.medicines.map((med, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg relative">
                <button type="button" onClick={() => removeMedicine(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-sm"><FaTrash /></button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Medicine Name *</label>
                    <input className="input-field text-sm" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} placeholder="e.g., Paracetamol 500mg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dosage *</label>
                    <input className="input-field text-sm" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} placeholder="e.g., 1 tablet" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Frequency *</label>
                    <input className="input-field text-sm" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} placeholder="e.g., Twice daily" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Duration *</label>
                    <input className="input-field text-sm" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} placeholder="e.g., 5 days" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Special Instructions</label>
                    <input className="input-field text-sm" value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} placeholder="e.g., Take after meals" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Tests */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Lab Tests</h3>
          <div className="flex gap-2 mb-3">
            <input className="input-field flex-1" placeholder="Add a lab test..." value={labTest} onChange={e => setLabTest(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLabTest())} />
            <button type="button" onClick={addLabTest} className="btn-secondary">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.labTests.map((t, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {t} <button type="button" onClick={() => setForm({ ...form, labTests: form.labTests.filter((_, idx) => idx !== i) })} className="text-blue-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Notes & Follow-up */}
        <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <input type="date" className="input-field" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {/* AI Explanation */}
        <div className="card border border-purple-100 bg-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-purple-900 flex items-center gap-2"><FaRobot /> AI Patient Explanation</h3>
            <button type="button" onClick={getAiExplanation} disabled={aiLoading} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
              {aiLoading ? 'Generating...' : 'Generate Explanation'}
            </button>
          </div>
          {aiExplanation ? (
            <div className="bg-white p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{aiExplanation}</div>
          ) : (
            <p className="text-sm text-purple-600">Click "Generate Explanation" to create an AI-powered simple explanation for the patient.</p>
          )}
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Prescription'}</button>
        </div>
      </form>
    </Layout>
  );
}