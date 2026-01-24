const express = require('express');
const router = express.Router();
const lifestyleController = require('../controllers/lifestyleController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Patient routes
router.post('/daily', auth, roleCheck('patient'), lifestyleController.createOrUpdateDaily);
router.get('/history', auth, roleCheck('patient'), lifestyleController.getMyHistory);
router.get('/daily/:date', auth, roleCheck('patient'), lifestyleController.getDailyByDate);

// Doctor/Nurse routes
router.get('/patient/:patientId', auth, roleCheck('doctor', 'nurse', 'admin'), lifestyleController.getPatientHistory);

module.exports = router;
