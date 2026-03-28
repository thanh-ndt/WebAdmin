const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { getReviewStats, getReviews, deleteReview } = require('../controllers/reviewController');

router.use(protect, ownerOnly);

router.get('/stats', getReviewStats);
router.get('/', getReviews);
router.delete('/:id', deleteReview);

module.exports = router;
