import React from 'react';
import { useState } from 'react';
import Layout from '../../components/shared/Layout';
import { aiAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaStethoscope, FaRobot, FaPlus, FaTimes } from 'react-icons/fa';

const COMMON_SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Chest pain', 'Shortness of breath', 'Back pain', 'Dizziness', 'Rash'];

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState([]);
  const [input, setInput] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addSymptom = (s) => {
    const val = s || input.trim();
    if (val && !symptoms.includes(val)) {
      setSymptoms([...symptoms, val]);
      setInput('');
    }
  };

  const removeSymptom = (s) => setSymptoms(symptoms.filter(x => x !== s));

  const analyze = async () => {
    if (symptoms.length === 0) return toast.error('Please add at least one symptom');
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.symptomCheck({ symptoms, age, gender });
      setResult(res.data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-700 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaStethoscope className="text-blue-600" /> AI Symptom Checker
        </h1>
        <p className="text-gray-500">Enter your symptoms and get AI-powered insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Your Information (Optional)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Age</label>
                <input type="number" className="input-field" placeholder="e.g., 30" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Gender</label>
                <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Symptoms</h3>
            <div className="flex gap-2 mb-4">
              <input className="input-field flex-1" placeholder="Type a symptom..." value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom())} />
              <button onClick={() => addSymptom()} className="btn-primary flex items-center gap-1"><FaPlus /> Add</button>
            </div>

            {/* Added symptoms */}
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {symptoms.map(s => (
                  <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {s}
                    <button onClick={() => removeSymptom(s)} className="text-blue-400 hover:text-red-500"><FaTimes /></button>
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 mb-2">Common symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.filter(s => !symptoms.includes(s)).map(s => (
                  <button key={s} onClick={() => addSymptom(s)}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={analyze} disabled={loading || symptoms.length === 0} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              <FaRobot />
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="card flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">AI is analyzing your symptoms...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Urgency */}
              {result.urgency && (
                <div className={`card ${urgencyColor[result.urgency] || 'bg-gray-50'}`}>
                  <p className="font-bold text-lg">Urgency: {result.urgency?.toUpperCase()}</p>
                  {result.urgency === 'high' && <p className="text-sm mt-1">⚠️ Please seek immediate medical attention.</p>}
                </div>
              )}

              {/* Conditions */}
              {result.conditions && (
                <div className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">🔍 Possible Conditions</h3>
                  <div className="space-y-2">
                    {(Array.isArray(result.conditions) ? result.conditions : []).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium min-w-fit">#{i + 1}</span>
                        <p className="text-sm text-gray-700">{typeof c === 'string' ? c : c.name || JSON.stringify(c)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialist */}
              {result.specialist && (
                <div className="card bg-green-50 border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-1">👨‍⚕️ Recommended Specialist</h3>
                  <p className="text-green-700">{result.specialist}</p>
                </div>
              )}

              {/* Advice */}
              {result.advice && (
                <div className="card">
                  <h3 className="font-semibold mb-2">💡 General Advice</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{typeof result.advice === 'string' ? result.advice : JSON.stringify(result.advice)}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="card bg-yellow-50 border border-yellow-100">
                <p className="text-xs text-yellow-700">⚠️ <strong>Disclaimer:</strong> This is AI-generated information and is not a substitute for professional medical diagnosis. Always consult a qualified doctor.</p>
              </div>

              {/* Raw response fallback */}
              {result.rawResponse && (
                <div className="card">
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.rawResponse}</p>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <FaStethoscope className="text-5xl text-blue-200 mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Enter Your Symptoms</h3>
              <p className="text-gray-400 text-sm">Add your symptoms on the left and click "Analyze" to get AI-powered health insights.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}