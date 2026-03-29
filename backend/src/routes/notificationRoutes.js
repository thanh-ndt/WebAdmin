const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect, adminOnly, ownerOnly } = require('../middleware/authMiddleware');

// Các route này yêu cầu quyền owner (admin)
router.use(protect);
router.use(ownerOnly);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
