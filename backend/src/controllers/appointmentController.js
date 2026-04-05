const TestDriveAppointment = require('../models/TestDriveAppointment');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

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

    // Tạo thông báo cho khách hàng
    try {
        let statusText = status;
        switch(status) {
            case 'pending': statusText = 'Đang chờ xác nhận'; break;
            case 'confirmed': statusText = 'Đã xác nhận'; break;
            case 'completed': statusText = 'Đã hoàn thành'; break;
            case 'cancelled': statusText = 'Đã bị hủy'; break;
        }

        if (appointment.customer) {
            const newNotif = new Notification({
                owner: appointment.customer._id,
                title: 'Cập nhật lịch hẹn lái thử',
                message: `Lịch hẹn lái thử xe ${appointment.vehicle?.name || 'mô tô'} của bạn đã được chuyển sang trạng thái: ${statusText}.`,
                isRead: false
            });
            await newNotif.save();
        }

        // 🟢 Gửi Email khi xác nhận hoặc hoàn thành lịch hẹn
        if (status === 'confirmed' || status === 'completed') {
            try {
                const targetEmail = appointment.customer?.email || appointment.guestEmail;
                const targetName = appointment.customer?.fullName || appointment.guestName;

                if (targetEmail) {
                    const isConfirmed = status === 'confirmed';
                    const subject = isConfirmed 
                        ? 'Xác nhận lịch hẹn xem xe thành công' 
                        : 'Cảm ơn bạn đã đến xem xe';
                    
                    const titleHeader = isConfirmed ? 'Lịch Hẹn Đã Được Xác Nhận' : 'Hoàn Thành Lịch Xem Xe';
                    const greetingText = isConfirmed 
                        ? 'Chúng tôi rất vui mừng thông báo rằng lịch hẹn xem xe của bạn đã được xác nhận thành công.' 
                        : 'Cảm ơn bạn đã dành thời gian đến cửa hàng của chúng tôi để xem xe.';

                    await sendEmail({
                        to: targetEmail,
                        subject: subject,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <h2 style="color: ${isConfirmed ? '#3182ce' : '#27ae60'}; text-align: center;">${titleHeader}</h2>
                                <p>Xin chào <strong>${targetName || 'Quý khách'}</strong>,</p>
                                <p>${greetingText}</p>
                                
                                <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>Mẫu xe:</strong> ${appointment.vehicle?.name || 'Xe máy'}</p>
                                    <p style="margin: 5px 0;"><strong>Ngày hẹn:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</p>
                                    <p style="margin: 5px 0;"><strong>Khung giờ:</strong> ${appointment.timeSlot}</p>
                                    <p style="margin: 5px 0;"><strong>Trạng thái:</strong> ${statusText}</p>
                                </div>
                                
                                <p>${isConfirmed ? 'Hẹn gặp lại bạn tại cửa hàng đúng giờ đã hẹn!' : 'Hy vọng bạn đã chọn được mẫu xe ưng ý. Rất mong sớm được hỗ trợ bạn trong các bước tiếp theo.'}</p>
                                
                                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                <p style="font-size: 12px; color: #718096; text-align: center;">Hotline hỗ trợ: 1900 xxxx</p>
                            </div>
                        `
                    });
                }
            } catch (emailErr) {
                console.error('Lỗi khi gửi email thông báo lịch hẹn:', emailErr);
            }
        }
    } catch (err) {
        console.error('Lỗi tạo thông báo lịch hẹn:', err);
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

// GET /api/appointments/stats - Lấy thống kê lịch hẹn
exports.getAppointmentStats = async (req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      TestDriveAppointment.countDocuments(),
      TestDriveAppointment.countDocuments({ status: 'pending' }),
      TestDriveAppointment.countDocuments({ status: 'confirmed' }),
      TestDriveAppointment.countDocuments({ status: 'completed' }),
      TestDriveAppointment.countDocuments({ status: 'cancelled' }),
    ]);

    res.json({ total, pending, confirmed, completed, cancelled });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê lịch hẹn', error: error.message });
  }
};
