const express = require('express');
const router = express.Router();
const bpController = require('../controllers/bloodPressureController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create record (patient or nurse)
router.post('/', auth, roleCheck('patient', 'nurse'), bpController.createRecord);

// Get records
router.get('/my-records', auth, bpController.getRecords);
router.get('/patient/:patientId', auth, roleCheck('admin', 'doctor', 'nurse'), bpController.getRecords);

// Get latest record
router.get('/latest', auth, bpController.getLatestRecord);
router.get('/latest/:patientId', auth, roleCheck('admin', 'doctor', 'nurse'), bpController.getLatestRecord);

// Get statistics
router.get('/statistics', auth, bpController.getStatistics);
router.get('/statistics/:patientId', auth, roleCheck('admin', 'doctor', 'nurse'), bpController.getStatistics);

// Get today's records count (for nurse dashboard)
router.get('/today-count', auth, roleCheck('nurse', 'admin'), bpController.getTodayCount);

// Delete record (admin only)
router.delete('/:id', auth, roleCheck('admin'), bpController.deleteRecord);

module.exports = router;
