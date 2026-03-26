import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import '../styles/AdminLayout.css';

const menuItems = [
  { path: '/admin', icon: 'bi-grid-1x2-fill', label: 'Tổng quan', end: true },
  { path: '/admin/vehicles', icon: 'bi-truck', label: 'Quản lý xe' },
  { path: '/admin/brands', icon: 'bi-tags-fill', label: 'Quản lý thương hiệu' },
  { path: '/admin/appointments', icon: 'bi-calendar-check-fill', label: 'Quản lý lịch hẹn' },
  { path: '/admin/messages', icon: 'bi-chat-dots-fill', label: 'Chat hỗ trợ' },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user || user.role !== 'owner') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="bi bi-speedometer2"></i>
            <span>Admin Panel</span>
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
          <div className="sidebar-user">
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
            <button className="header-btn notification-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
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
