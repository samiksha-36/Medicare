const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
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
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    maxlength: 500
  },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g., "twice daily"
    duration: { type: String, required: true },  // e.g., "7 days"
    instructions: { type: String }
  }],
  labTests: [{ type: String }],
  followUpDate: { type: Date },
  notes: { type: String, maxlength: 1000 },
  aiExplanation: { type: String }, // AI-generated explanation
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);