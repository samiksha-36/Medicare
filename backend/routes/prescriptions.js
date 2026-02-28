const express = require('express');
const router = express.Router();
const {
  createPrescription, getPrescriptions, getPrescription, updateAiExplanation
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
const { validatePrescription } = require('../middleware/validate');

router.get('/', protect, getPrescriptions);
router.post('/', protect, authorize('doctor'), validatePrescription, createPrescription);
router.get('/:id', protect, getPrescription);
router.put('/:id/ai-explanation', protect, authorize('doctor'), updateAiExplanation);

module.exports = router;