const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskAnalysisController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get risk analysis
router.get('/my-analysis', auth, riskController.getRiskAnalysis);
router.get('/patient/:patientId', auth, roleCheck('admin', 'doctor', 'nurse'), riskController.getRiskAnalysis);

module.exports = router;
