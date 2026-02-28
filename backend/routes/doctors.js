const express = require('express');
const router = express.Router();
const {
  getAllDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor, getDoctorAppointments
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.get('/:id', getDoctor);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);
router.get('/:id/appointments', protect, authorize('admin', 'doctor'), getDoctorAppointments);

module.exports = router;