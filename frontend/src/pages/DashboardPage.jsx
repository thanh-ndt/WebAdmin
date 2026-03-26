import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/adminApi';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [topVehicles, setTopVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data.stats);
      setTopVehicles(data.topVehicles || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h2>👋 Chào mừng trở lại, Admin!</h2>
        <p>Đây là tổng quan hoạt động hệ thống của bạn hôm nay.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-body">
            <div className="stat-card-info">
              <h3>{stats?.totalVehicles || 0}</h3>
              <p>Tổng số xe</p>
            </div>
            <div className="stat-card-icon primary">
              <i className="bi bi-truck"></i>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-body">
            <div className="stat-card-info">
              <h3>{stats?.totalOrders || 0}</h3>
              <p>Tổng đơn hàng</p>
            </div>
            <div className="stat-card-icon success">
              <i className="bi bi-receipt"></i>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-body">
            <div className="stat-card-info">
              <h3>{stats?.totalUsers || 0}</h3>
              <p>Người dùng</p>
            </div>
            <div className="stat-card-icon warning">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-card-body">
            <div className="stat-card-info">
              <h3>{formatCurrency(stats?.totalRevenue)}</h3>
              <p>Doanh thu</p>
            </div>
            <div className="stat-card-icon info">
              <i className="bi bi-currency-dollar"></i>
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-card-body">
            <div className="stat-card-info">
              <h3>{stats?.pendingAppointments || 0}</h3>
              <p>Lịch hẹn chờ duyệt</p>
            </div>
            <div className="stat-card-icon danger">
              <i className="bi bi-calendar-check"></i>
            </div>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-card-body">
            <div className="stat-card-info">
              <h3>{stats?.totalBrands || 0}</h3>
              <p>Thương hiệu</p>
            </div>
            <div className="stat-card-icon primary">
              <i className="bi bi-tags-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Vehicles */}
      {topVehicles.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🏆 Xe bán chạy nhất</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên xe</th>
                <th>Thương hiệu</th>
                <th>Giá</th>
                <th>Đã bán</th>
              </tr>
            </thead>
            <tbody>
              {topVehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>
                    {vehicle.images?.[0] ? (
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.name}
                        className="vehicle-thumb"
                      />
                    ) : (
                      <div className="vehicle-thumb" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-image" style={{ color: '#94a3b8' }}></i>
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{vehicle.name}</td>
                  <td>{vehicle.brand?.name || 'N/A'}</td>
                  <td>{formatCurrency(vehicle.price)}</td>
                  <td>
                    <span className="badge-status badge-completed">
                      {vehicle.soldCount} đã bán
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
