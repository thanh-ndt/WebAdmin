const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Điểm đánh giá là bắt buộc'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi khách hàng chỉ đánh giá 1 lần cho mỗi xe
reviewSchema.index({ customer: 1, vehicle: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
