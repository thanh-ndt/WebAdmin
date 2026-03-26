const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Comparison = mongoose.model('Comparison', comparisonSchema);

module.exports = Comparison;
