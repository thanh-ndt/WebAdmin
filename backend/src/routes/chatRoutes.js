const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/', chatController.getChatRooms);
router.get('/:roomId/messages', chatController.getMessages);
router.post('/:roomId/messages', chatController.sendMessage);

module.exports = router;
