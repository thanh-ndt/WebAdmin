const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Lý do trả hàng là bắt buộc'],
      trim: true,
    },
    imageProof: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

module.exports = ReturnRequest;
