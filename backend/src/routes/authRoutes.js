const express = require('express');
const router = express.Router();
const {
    login,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
