const Review = require('../models/Review');

// GET /api/reviews/stats
const getReviewStats = async (req, res) => {
    try {
        const total = await Review.countDocuments();

        const ratingDist = await Review.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        const avgResult = await Review.aggregate([
            { $group: { _id: null, avg: { $avg: '$rating' } } },
        ]);
        const avgRating = avgResult[0]?.avg ? parseFloat(avgResult[0].avg.toFixed(1)) : 0;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratingDist.forEach(({ _id, count }) => {
            distribution[_id] = count;
        });

        res.json({ total, avgRating, distribution });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reviews?page=1&limit=10&rating=&search=
const getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, rating = '', search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const filter = {};
        if (rating) filter.rating = parseInt(rating);

        if (search.trim()) {
            const User = require('../models/User');
            const Vehicle = require('../models/Vehicle');

            const [users, vehicles] = await Promise.all([
                User.find({
                    $or: [
                        { fullName: { $regex: search.trim(), $options: 'i' } },
                        { email: { $regex: search.trim(), $options: 'i' } },
                    ],
                }).select('_id'),
                Vehicle.find({ name: { $regex: search.trim(), $options: 'i' } }).select('_id'),
            ]);

            filter.$or = [
                { customer: { $in: users.map((u) => u._id) } },
                { vehicle: { $in: vehicles.map((v) => v._id) } },
            ];
        }

        const total = await Review.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum) || 1;

        const reviews = await Review.find(filter)
            .populate('customer', 'fullName email avatar')
            .populate('vehicle', 'name images category')
            .sort({ postedDate: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        res.json({ reviews, total, totalPages, page: pageNum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        res.json({ message: 'Xóa đánh giá thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReviewStats, getReviews, deleteReview };