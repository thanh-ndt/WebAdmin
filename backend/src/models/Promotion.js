const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Mã khuyến mãi là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Giá trị giảm giá là bắt buộc'],
      min: 0,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Loại khuyến mãi là bắt buộc'],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
