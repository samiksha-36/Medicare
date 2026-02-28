const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;

    let query = {};
    if (specialization) query.specialization = new RegExp(specialization, 'i');

    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone profileImage isActive')
      .lean();

    let result = doctors.filter(d => d.user?.isActive);

    if (search) {
      result = result.filter(d =>
        d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ count: result.length, doctors: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone profileImage gender');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Create doctor (Admin)
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
  try {
    const {
      name, email, password, phone, specialization,
      qualifications, experience, consultationFee, availableSlots, bio, hospital
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, role: 'doctor', phone });

    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      qualifications: qualifications || [],
      experience,
      consultationFee,
      availableSlots: availableSlots || [],
      bio,
      hospital,
      isVerified: true
    });

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: await doctor.populate('user', 'name email phone')
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin or Doctor(own)
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Doctors can only update their own profile
    if (req.user.role === 'doctor' && doctor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      specialization, qualifications, experience, consultationFee,
      availableSlots, bio, hospital, name, phone
    } = req.body;

    // Update doctor profile
    Object.assign(doctor, {
      ...(specialization && { specialization }),
      ...(qualifications && { qualifications }),
      ...(experience !== undefined && { experience }),
      ...(consultationFee !== undefined && { consultationFee }),
      ...(availableSlots && { availableSlots }),
      ...(bio && { bio }),
      ...(hospital && { hospital })
    });

    await doctor.save();

    // Update user info if provided
    if (name || phone) {
      await User.findByIdAndUpdate(doctor.user, { name, phone });
    }

    res.json({ message: 'Doctor updated successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Delete doctor (Admin)
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Deactivate user instead of hard delete
    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Doctor removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private/Doctor/Admin
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorUser = req.params.id === 'me' ? req.user.id : req.params.id;

    const appointments = await Appointment.find({ doctor: doctorUser })
      .populate('patient', 'name email phone dateOfBirth gender')
      .sort({ appointmentDate: -1 });

    res.json({ count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments
};