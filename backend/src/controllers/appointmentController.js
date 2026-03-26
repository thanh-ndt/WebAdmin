const TestDriveAppointment = require('../models/TestDriveAppointment');

// GET /api/appointments - Lấy danh sách lịch hẹn
exports.getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await TestDriveAppointment.countDocuments(query);
    const appointments = await TestDriveAppointment.find(query)
      .populate('customer', 'fullName email phone')
      .populate('vehicle', 'name images price')
      .sort({ appointmentDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      appointments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/appointments/:id/status - Cập nhật trạng thái lịch hẹn
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const appointment = await TestDriveAppointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('customer', 'fullName email phone')
      .populate('vehicle', 'name images price');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

// DELETE /api/appointments/:id - Xóa lịch hẹn
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await TestDriveAppointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    res.json({ message: 'Xóa lịch hẹn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa lịch hẹn', error: error.message });
  }
};
