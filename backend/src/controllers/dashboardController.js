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
