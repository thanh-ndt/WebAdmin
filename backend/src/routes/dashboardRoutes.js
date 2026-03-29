const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/monthly-revenue', dashboardController.getMonthlyRevenue);
router.get('/revenue-details/:year/:month', dashboardController.getRevenueDetails);

module.exports = router;
