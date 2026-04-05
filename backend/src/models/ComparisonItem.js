const mongoose = require('mongoose');

const comparisonItemSchema = new mongoose.Schema(
  {
    comparison: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comparison',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi xe chỉ xuất hiện 1 lần trong 1 so sánh
comparisonItemSchema.index({ comparison: 1, vehicle: 1 }, { unique: true });

const ComparisonItem = mongoose.model('ComparisonItem', comparisonItemSchema);

module.exports = ComparisonItem;
