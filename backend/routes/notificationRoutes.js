const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Notifications
router.get('/', auth, notifController.getNotifications);
router.get('/unread-count', auth, notifController.getUnreadCount);
router.put('/:id/read', auth, notifController.markAsRead);
router.put('/read-all', auth, notifController.markAllAsRead);
router.delete('/:id', auth, notifController.deleteNotification);

// Reminders
router.get('/reminders', auth, notifController.getReminders);
router.get('/reminders/:patientId', auth, notifController.getReminders);
router.post('/reminders', auth, notifController.createReminder);
router.put('/reminders/:id/complete', auth, notifController.completeReminder);

module.exports = router;
