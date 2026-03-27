const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User');
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
