const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
require('../models/Promotion');

// GET /api/orders/stats
const getOrderStats = async (req, res) => {
  try {
    const [total, pending, confirmed, shipping, delivered, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipping' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const revenue = revenueResult[0]?.total || 0;

    res.json({ total, pending, confirmed, shipping, delivered, cancelled, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders?page=1&limit=10&status=&search=
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    if (search.trim()) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { phoneNumber: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');
      filter.customer = { $in: users.map((u) => u._id) };
    }

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const orders = await Order.find(filter)
      .populate('customer', 'fullName email phoneNumber avatar')
      .populate('promotion', 'code discountPercent')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ orders, total, totalPages, page: pageNum });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phoneNumber avatar')
      .populate('promotion', 'code discountPercent');

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const details = await OrderDetail.find({ order: order._id }).populate(
      'vehicle',
      'name price images category'
    );

    res.json({ order, details });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'fullName email');

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Tạo thông báo cho khách hàng
    try {
        let statusText = status;
        switch(status) {
            case 'pending': statusText = 'Đang chờ xác nhận'; break;
            case 'confirmed': statusText = 'Đã xác nhận'; break;
            case 'shipping': statusText = 'Đang giao hàng'; break;
            case 'delivered': statusText = 'Đã giao hàng thành công'; break;
            case 'cancelled': statusText = 'Đã hủy'; break;
        }

        if (order.customer) {
            const newNotif = new Notification({
                owner: order.customer._id,
                title: 'Cập nhật trạng thái đơn hàng',
                message: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} của bạn đã được chuyển sang trạng thái: ${statusText}.`,
                isRead: false
            });
            await newNotif.save();

            // 🟢 Gửi Email khi đơn hàng đã giao thành công
            if (status === 'delivered') {
                try {
                    await sendEmail({
                        to: order.customer.email,
                        subject: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã giao thành công`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <h2 style="color: #27ae60; text-align: center;">Giao Hàng Thành Công!</h2>
                                <p>Xin chào <strong>${order.customer.fullName}</strong>,</p>
                                <p>Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã lựa chọn mua sắm tại hệ thống của chúng tôi!</p>
                                
                                <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${order._id.toString().toUpperCase()}</p>
                                    <p style="margin: 5px 0;"><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN').format(order.totalAmount)} VNĐ</p>
                                    <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Đã giao hàng</p>
                                </div>
                                
                                <p>Chúng tôi hy vọng bạn hài lòng với sản phẩm đã nhận. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>1900 xxxx</strong></p>
                                
                                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                <p style="font-size: 12px; color: #718096; text-align: center;">Chúc bạn một ngày tuyệt vời!</p>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error('Lỗi khi gửi email xác nhận đơn hàng:', emailErr);
                }
            }
        }
    } catch (err) {
        console.error('Lỗi tạo thông báo đơn hàng:', err);
    }

    res.json({ message: 'Cập nhật trạng thái thành công', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    await OrderDetail.deleteMany({ order: req.params.id });

    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrderStats, getOrders, getOrderById, updateOrderStatus, deleteOrder };
