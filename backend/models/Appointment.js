const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  doctorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    maxlength: 500
  },
  symptoms: [{ type: String }],
  notes: { type: String, maxlength: 1000 },
  type: {
    type: String,
    enum: ['in-person', 'online'],
    default: 'in-person'
  },
  fee: { type: Number },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });

// Index for faster queries
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);