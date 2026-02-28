import React from 'react';
import { useState } from 'react';
import Layout from '../../components/shared/Layout';
import { aiAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaFileAlt, FaRobot, FaUpload } from 'react-icons/fa';

export default function ReportSummarizer() {
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('medical report');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return toast.error('File size must be under 1MB');

    const reader = new FileReader();
    reader.onload = (ev) => setReportText(ev.target.result);
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!reportText.trim()) return toast.error('Please enter or upload report text');
    setLoading(true);
    setSummary('');
    try {
      const res = await aiAPI.summarizeReport({ reportText, reportType });
      setSummary(res.data.summary);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaFileAlt className="text-green-600" /> AI Report Summarizer
        </h1>
        <p className="text-gray-500">Upload a medical report and get a simple AI summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input side */}
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select className="input-field" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="medical report">General Medical Report</option>
              <option value="blood test">Blood Test Report</option>
              <option value="X-ray report">X-Ray Report</option>
              <option value="MRI report">MRI Report</option>
              <option value="pathology report">Pathology Report</option>
              <option value="discharge summary">Discharge Summary</option>
            </select>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Report Text</label>
              <label className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <FaUpload className="text-xs" />
                Upload .txt file
                <input type="file" accept=".txt" onChange={handleFile} className="hidden" />
              </label>
            </div>
            <textarea
              className="input-field"
              rows={12}
              placeholder="Paste your medical report text here, or upload a .txt file above..."
              value={reportText}
              onChange={e => setReportText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">{reportText.length} characters</p>
              {reportText && (
                <button onClick={() => setReportText('')} className="text-xs text-red-400 hover:underline">Clear</button>
              )}
            </div>
          </div>

          <button onClick={analyze} disabled={loading || !reportText.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <FaRobot />
            {loading ? 'Analyzing Report...' : 'Summarize Report'}
          </button>
        </div>

        {/* Output side */}
        <div>
          {loading && (
            <div className="card flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-500">AI is analyzing your report...</p>
              <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
            </div>
          )}

          {summary && !loading && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <FaRobot className="text-green-600" />
                <h3 className="font-semibold text-gray-900">AI Summary</h3>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700">⚠️ This summary is AI-generated and for informational purposes only. Always discuss your report with your doctor.</p>
              </div>
            </div>
          )}

          {!summary && !loading && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <FaFileAlt className="text-5xl text-green-200 mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">AI Report Analysis</h3>
              <p className="text-gray-400 text-sm max-w-sm">Paste your medical report text or upload a file, then click "Summarize" to get a simple patient-friendly explanation.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-xs">
                {['Key findings', 'Simple explanation', 'Next steps', 'Red flags'].map(f => (
                  <div key={f} className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-700 font-medium">✓ {f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}