const mongoose = require('mongoose');

const vehicleModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên dòng xe là bắt buộc'],
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Hãng xe là bắt buộc']
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);

module.exports = VehicleModel;
