const express = require('express');
const router = express.Router();
const {
    login,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

// PUT /api/auth/update-profile
router.put('/update-profile', protect, updateProfile);

// PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

module.exports = router;
