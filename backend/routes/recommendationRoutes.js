const express = require('express');
const router = express.Router();
const recController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create recommendation (doctor only)
router.post('/', auth, roleCheck('doctor'), recController.createRecommendation);

// Get recommendations
router.get('/my-recommendations', auth, recController.getRecommendations);
router.get('/patient/:patientId', auth, roleCheck('admin', 'doctor', 'nurse'), recController.getRecommendations);

// Download PDF
router.get('/download/pdf', auth, recController.downloadRecommendationsPDF);
router.get('/download/pdf/:patientId', auth, roleCheck('admin', 'doctor'), recController.downloadRecommendationsPDF);

// Delete recommendation
router.delete('/:id', auth, roleCheck('admin', 'doctor'), recController.deleteRecommendation);

module.exports = router;
