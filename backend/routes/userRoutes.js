const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Admin only routes
router.get('/', auth, roleCheck('admin', 'doctor', 'nurse'), userController.getAllUsers);
router.post('/', auth, roleCheck('admin'), userController.createUser);
router.delete('/:id', auth, roleCheck('admin'), userController.deleteUser);

// Patient list for staff
router.get('/patients', auth, roleCheck('admin', 'doctor', 'nurse'), userController.getPatients);
router.get('/patients/high-risk', auth, roleCheck('admin', 'doctor'), userController.getHighRiskPatients);

// User profile routes
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, userController.updateUser);
router.put('/:id/profile', auth, userController.updatePatientProfile);

module.exports = router;
