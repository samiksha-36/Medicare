const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Auth validators
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'doctor', 'patient']).withMessage('Invalid role'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Appointment validators
const validateAppointment = [
  body('doctor').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 500 }),
  handleValidationErrors
];

// Prescription validators
const validatePrescription = [
  body('appointment').notEmpty().withMessage('Appointment ID is required'),
  body('patient').notEmpty().withMessage('Patient ID is required'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('medicines.*.name').notEmpty().withMessage('Medicine name is required'),
  body('medicines.*.dosage').notEmpty().withMessage('Dosage is required'),
  body('medicines.*.frequency').notEmpty().withMessage('Frequency is required'),
  body('medicines.*.duration').notEmpty().withMessage('Duration is required'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointment,
  validatePrescription
};