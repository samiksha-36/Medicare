const express = require('express');
const router = express.Router();
const {
  bookAppointment, getAppointments, getAppointment,
  updateAppointmentStatus, cancelAppointment, getAnalytics
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validate');

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/', protect, getAppointments);
router.post('/', protect, authorize('patient'), validateAppointment, bookAppointment);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, authorize('admin', 'doctor'), updateAppointmentStatus);
router.put('/:id/cancel', protect, authorize('patient'), cancelAppointment);

module.exports = router;