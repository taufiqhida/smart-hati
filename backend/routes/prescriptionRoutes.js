const express = require('express');
const router = express.Router();
const prescController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create prescription (doctor only)
router.post('/', auth, roleCheck('doctor'), prescController.createPrescription);

// Get prescriptions
router.get('/my-prescriptions', auth, prescController.getPrescriptions);
router.get('/patient/:patientId', auth, roleCheck('admin', 'doctor', 'nurse'), prescController.getPrescriptions);

// Download PDF
router.get('/download/pdf/:id', auth, prescController.downloadPrescriptionPDF);

// Delete prescription
router.delete('/:id', auth, roleCheck('admin', 'doctor'), prescController.deletePrescription);

module.exports = router;
