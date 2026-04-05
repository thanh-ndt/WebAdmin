const mongoose = require('mongoose');

const testDriveAppointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guestName: {
      type: String,
      trim: true,
    },
    guestPhone: {
      type: String,
      trim: true,
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Ngày hẹn lái thử là bắt buộc'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Khung giờ là bắt buộc'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const TestDriveAppointment = mongoose.model(
  'TestDriveAppointment',
  testDriveAppointmentSchema
);

module.exports = TestDriveAppointment;
