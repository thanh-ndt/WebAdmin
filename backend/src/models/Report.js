const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      type: String,
      required: [true, 'Kỳ báo cáo là bắt buộc'],
      trim: true,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalOrder: {
      type: Number,
      default: 0,
    },
    topSellingVehicle: {
      type: String,
      trim: true,
    },
    returnRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
