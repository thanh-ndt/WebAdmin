const mongoose = require('mongoose');

const vehicleModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên dòng xe là bắt buộc'],
      trim: true,
    },
    engineType: {
      type: String,
      trim: true,
    },
    fuelType: {
      type: String,
      trim: true,
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
