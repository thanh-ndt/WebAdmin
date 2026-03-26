const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên xe là bắt buộc'],
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Thương hiệu là bắt buộc'],
    },
    vehicleModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleModel',
      required: [true, 'Dòng xe là bắt buộc'],
    },
    category: {
      type: String,
      enum: ['Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Xe điện', 'Phân khối nhỏ cổ điển'],
      default: 'Xe ga',
      trim: true,
    },
    engineCapacity: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Phân khối động cơ (cc), 0 = xe điện hoặc chưa xác định',
    },
    manufacture: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    specifications: {
      type: Object,
      default: {},
    },
    price: {
      type: Number,
      required: [true, 'Giá xe là bắt buộc'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available',
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoritesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: formattedPrice -> e.g 150.000.000 VNĐ
vehicleSchema.virtual('formattedPrice').get(function () {
  if (this.price == null) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(this.price) + ' VNĐ';
});

// Middleware: normalize name before saving
vehicleSchema.pre('save', function () {
  if (this.name) {
    // Trim extra spaces and capitalize the first letter of each word
    this.name = this.name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
