import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { io } from 'socket.io-client';
import { getAdminNotifications, markNotificationAsRead } from '../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AdminProfileModal from './AdminProfileModal';
import '../styles/AdminLayout.css';

const menuItems = [
  { path: '/admin', icon: 'bi-grid-1x2-fill', label: 'Tổng quan', end: true },
  { path: '/admin/vehicles', icon: 'bi-truck', label: 'Quản lý xe' },
  { path: '/admin/brands', icon: 'bi-tags-fill', label: 'Quản lý thương hiệu' },
  { path: '/admin/vehicle-models', icon: 'bi-grid-fill', label: 'Quản lý dòng xe' },
  { path: '/admin/appointments', icon: 'bi-calendar-check-fill', label: 'Quản lý lịch hẹn' },
  { path: '/admin/messages', icon: 'bi-chat-dots-fill', label: 'Chat hỗ trợ' },
  { path: '/admin/users', icon: 'bi-people-fill', label: 'Quản lý người dùng' },
  { path: '/admin/orders', icon: 'bi-bag-check-fill', label: 'Quản lý đơn hàng' },
  { path: '/admin/reviews', icon: 'bi-star-half', label: 'Quản lý đánh giá' },
  { path: '/admin/revenue', icon: 'bi-cash-coin', label: 'Quản lý doanh thu' },
  { path: '/admin/promotions', icon: 'bi-megaphone-fill', label: 'Quản lý khuyến mãi' },
  { path: '/admin/returns', icon: 'bi-box-arrow-left', label: 'Quản lý trả hàng' },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const isAuthorized = token && user && (user.role === 'owner' || user.role === 'admin');

  const fetchNotifications = async () => {
    try {
      const { data } = await getAdminNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchNotifications();

      const socket = io('https://cnpmhdt-admin.onrender.com', {
        withCredentials: true,
      });

      socket.on('new_admin_notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthorized]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
      }
    }
    setShowNotifications(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="bi bi-speedometer2"></i>
            <span>Hệ Thống Quản Trị</span>
          </div>
          <button
            className="sidebar-close-btn d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MENU CHÍNH</div>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => setShowProfileModal(true)}>
            <div className="sidebar-user-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.fullName || 'Admin'}</span>
              <span className="sidebar-user-role">Quản trị viên</span>
            </div>
          </div>
        </div>
      </aside>

      <AdminProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
      />

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="hamburger-btn d-lg-none"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list"></i>
          </button>
          <div className="header-title">
            <h1>Hệ thống quản lý</h1>
          </div>
          <div className="header-actions">
            <div className="notification-dropdown-container" style={{ position: 'relative' }}>
              <button
                className="header-btn notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown" style={{
                  position: 'absolute', top: '50px', right: 0, width: '340px',
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  zIndex: 50, maxHeight: '450px', overflowY: 'auto'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Thông báo ({unreadCount})</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      <i className="bi bi-bell-slash" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                      Chưa có thông báo nào
                    </div>
                  ) : (
                    <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column' }}>
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                            background: n.isRead ? 'white' : '#f0fdf4',
                            display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: n.isRead ? 'normal' : '600', fontSize: '14px', color: '#1e293b' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            <i className="bi bi-clock me-1"></i>
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="header-btn logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-md-inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
