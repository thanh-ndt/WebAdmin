const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getReviewStats, getReviews, deleteReview } = require('../controllers/reviewController');

router.use(protect, adminOnly);

router.get('/stats', getReviewStats);
router.get('/', getReviews);
router.delete('/:id', deleteReview);

module.exports = router;