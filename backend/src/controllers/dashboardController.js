const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const User = require('../models/User');
const Order = require('../models/Order');
const TestDriveAppointment = require('../models/TestDriveAppointment');

// GET /api/dashboard/stats - Lấy thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalVehicles,
      totalBrands,
      totalUsers,
      totalOrders,
      pendingAppointments,
      availableVehicles,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Brand.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      TestDriveAppointment.countDocuments({ status: 'pending' }),
      Vehicle.countDocuments({ status: 'available' }),
    ]);

    // Tính tổng doanh thu
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Xe bán chạy nhất
    const topVehicles = await Vehicle.find()
      .sort({ soldCount: -1 })
      .limit(5)
      .populate('brand', 'name')
      .select('name price soldCount images brand');

    res.json({
      stats: {
        totalVehicles,
        totalBrands,
        totalUsers,
        totalOrders,
        pendingAppointments,
        availableVehicles,
        totalRevenue,
      },
      topVehicles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/dashboard/monthly-revenue - Lấy doanh thu theo từng tháng
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $count: {} },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json(monthlyRevenue);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy doanh thu tháng', error: error.message });
  }
};

// GET /api/dashboard/revenue-details/:year/:month - Lấy chi tiết đơn hàng trong tháng
exports.getRevenueDetails = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      orderDate: { $gte: startDate, $lte: endDate },
    })
      .populate('customer', 'fullName email')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết doanh thu', error: error.message });
  }
};
