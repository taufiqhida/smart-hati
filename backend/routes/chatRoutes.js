const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Send message
router.post('/send', auth, chatController.sendMessage);

// Get conversation
router.get('/conversation/:partnerId', auth, chatController.getConversation);

// Get contacts
router.get('/contacts', auth, chatController.getChatContacts);

// Get unread count
router.get('/unread', auth, chatController.getUnreadCount);

module.exports = router;
