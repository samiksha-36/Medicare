const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
  try {
    const { appointment, patient, diagnosis, medicines, labTests, followUpDate, notes } = req.body;

    // Verify appointment belongs to this doctor
    const appt = await Appointment.findById(appointment);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (appt.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const prescription = await Prescription.create({
      appointment,
      patient,
      doctor: req.user.id,
      diagnosis,
      medicines,
      labTests: labTests || [],
      followUpDate,
      notes
    });

    // Update appointment status to completed
    await Appointment.findByIdAndUpdate(appointment, { status: 'completed' });

    await prescription.populate([
      { path: 'patient', select: 'name email dateOfBirth' },
      { path: 'doctor', select: 'name email' }
    ]);

    res.status(201).json({ message: 'Prescription created', prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user.id;
    else if (req.user.role === 'doctor') query.doctor = req.user.id;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email dateOfBirth gender')
      .populate('doctor', 'name email')
      .populate('appointment', 'appointmentDate timeSlot')
      .sort({ createdAt: -1 });

    res.json({ count: prescriptions.length, prescriptions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email dateOfBirth gender phone address')
      .populate('doctor', 'name email')
      .populate({ path: 'doctor', populate: { path: 'doctor', model: 'Doctor', select: 'specialization hospital qualifications' } })
      .populate('appointment', 'appointmentDate timeSlot reason');

    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    // Access control
    if (
      req.user.role === 'patient' && prescription.patient._id.toString() !== req.user.id ||
      req.user.role === 'doctor' && prescription.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update prescription AI explanation
// @route   PUT /api/prescriptions/:id/ai-explanation
// @access  Private/Doctor
const updateAiExplanation = async (req, res) => {
  try {
    const { aiExplanation } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { aiExplanation },
      { new: true }
    );
    res.json({ message: 'AI explanation saved', prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createPrescription, getPrescriptions, getPrescription, updateAiExplanation };