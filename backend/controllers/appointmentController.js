const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private/Patient
const bookAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, timeSlot, reason, symptoms, type } = req.body;

    // Check doctor exists
    const doctorProfile = await Doctor.findOne({ user: doctor });
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor not found' });

    // Check for conflicting appointment
    const conflict = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $nin: ['cancelled', 'rejected'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      doctorProfile: doctorProfile._id,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      symptoms: symptoms || [],
      type: type || 'in-person',
      fee: doctorProfile.consultationFee
    });

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email' }
    ]);

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get all appointments (Admin) / My appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (req.user.role === 'patient') query.patient = req.user.id;
    else if (req.user.role === 'doctor') query.doctor = req.user.id;
    // admin gets all

    if (status) query.status = status;
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'specialization consultationFee')
      .sort({ appointmentDate: -1 });

    res.json({ count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth gender address')
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'specialization consultationFee hospital');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Access control
    if (
      req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id ||
      req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private/Doctor/Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['approved', 'completed', 'cancelled', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Only the assigned doctor or admin can update
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.json({ message: 'Appointment status updated', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Cancel appointment (Patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Private/Patient
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Admin dashboard analytics
// @route   GET /api/appointments/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const [
      totalAppointments,
      pendingCount,
      completedCount,
      cancelledCount,
      approvedCount,
      totalDoctors,
      totalPatients,
      recentAppointments
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ status: 'approved' }),
      require('../models/User').countDocuments({ role: 'doctor', isActive: true }),
      require('../models/User').countDocuments({ role: 'patient', isActive: true }),
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patient', 'name')
        .populate('doctor', 'name')
    ]);

    // Monthly appointments for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      stats: {
        totalAppointments,
        pendingCount,
        completedCount,
        cancelledCount,
        approvedCount,
        totalDoctors,
        totalPatients
      },
      recentAppointments,
      monthlyData
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAnalytics
};