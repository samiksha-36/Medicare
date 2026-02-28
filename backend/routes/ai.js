const express = require('express');
const router = express.Router();
const { symptomCheck, explainPrescription, healthChat, summarizeReport } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.post('/symptom-check', protect, symptomCheck);
router.post('/explain-prescription', protect, explainPrescription);
router.post('/chat', protect, healthChat);
router.post('/summarize-report', protect, summarizeReport);

module.exports = router;