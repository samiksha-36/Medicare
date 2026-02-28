const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordType: {
    type: String,
    enum: ['lab_result', 'imaging', 'diagnosis', 'surgery', 'vaccination', 'other'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String },
  aiSummary: { type: String }, // AI-generated summary
  date: { type: Date, default: Date.now },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);