import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { prescriptionAPI } from '../../utils/api';
import { format } from 'date-fns';
import { FaFileMedical, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MedicalHistory() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    prescriptionAPI.getAll().then(res => setPrescriptions(res.data.prescriptions)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const downloadPDF = (p) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Hospital', pageW / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Medical Prescription', pageW / 2, 23, { align: 'center' });

    // Patient info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient: ${p.patient?.name}`, 14, 45);
    doc.text(`Doctor: Dr. ${p.doctor?.name}`, 14, 53);
    doc.text(`Date: ${format(new Date(p.createdAt), 'MMMM dd, yyyy')}`, 14, 61);
    doc.text(`Diagnosis: ${p.diagnosis}`, 14, 69);

    // Medicines table
    doc.autoTable({
      startY: 80,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: p.medicines.map(m => [m.name, m.dosage, m.frequency, m.duration, m.instructions || '-']),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    let y = doc.lastAutoTable.finalY + 10;

    if (p.labTests?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Lab Tests:', 14, y);
      doc.setFont('helvetica', 'normal');
      p.labTests.forEach((t, i) => { doc.text(`• ${t}`, 20, y + 8 + i * 7); });
      y += 15 + p.labTests.length * 7;
    }

    if (p.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(p.notes, 14, y + 8);
    }

    if (p.aiExplanation) {
      doc.addPage();
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient-Friendly Explanation (AI-Generated)', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(p.aiExplanation, pageW - 28);
      doc.text(lines, 14, 35);
    }

    doc.save(`prescription-${p.patient?.name}-${format(new Date(p.createdAt), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        <p className="text-gray-500">Your prescriptions and medical records</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="bg-blue-100 p-3 rounded-xl h-fit"><FaFileMedical className="text-blue-600 text-xl" /></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{p.diagnosis}</h3>
                        <p className="text-sm text-gray-500">Dr. {p.doctor?.name} • {format(new Date(p.createdAt), 'MMMM dd, yyyy')}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => downloadPDF(p)} className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">
                          <FaDownload /> PDF
                        </button>
                        <button onClick={() => toggle(p._id)} className="text-gray-400 hover:text-gray-600 p-1">
                          {expanded[p._id] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.medicines.map((m, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{m.name}</span>
                      ))}
                    </div>

                    {expanded[p._id] && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Medicines:</h4>
                          <div className="space-y-2">
                            {p.medicines.map((m, i) => (
                              <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                                <p className="font-medium">{m.name}</p>
                                <p className="text-gray-500">{m.dosage} • {m.frequency} • {m.duration}</p>
                                {m.instructions && <p className="text-gray-400 text-xs mt-1">ℹ️ {m.instructions}</p>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {p.labTests?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Lab Tests:</h4>
                            <div className="flex flex-wrap gap-2">
                              {p.labTests.map((t, i) => (
                                <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {p.aiExplanation && (
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-medium text-sm text-purple-700 mb-2 flex items-center gap-2">🤖 AI Explanation (Patient-Friendly)</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.aiExplanation}</p>
                          </div>
                        )}

                        {p.followUpDate && (
                          <p className="text-sm text-orange-600 font-medium">📅 Follow-up: {format(new Date(p.followUpDate), 'MMMM dd, yyyy')}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!prescriptions.length && (
            <div className="text-center py-16 text-gray-400">
              <FaFileMedical className="text-5xl mx-auto mb-4 opacity-30" />
              <p>No medical records yet</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}