import { useState, useEffect, useCallback } from 'react';
import { getUserStats, getUsers, getUserById, updateUser, deleteUser } from '../api/adminApi';

const ROLE_LABEL = { owner: 'Quản trị viên', customer: 'Khách hàng' };
const ROLE_CLASS = { owner: 'role-badge owner', customer: 'role-badge customer' };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function UserManagementPage() {
  // Stats
  const [stats, setStats] = useState(null);

  // Table
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const LIMIT = 10;

  // Detail modal
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const { data } = await getUserStats();
      setStats(data.data);
    } catch {
      // silent
    }
  };

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getUsers({
        page, limit: LIMIT,
        search: search.trim(),
        role: roleFilter === 'all' ? '' : roleFilter,
      });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch {
      showToast('Không thể tải danh sách người dùng!', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // ── View detail ──────────────────────────────────────────────────────────
  const handleViewDetail = async (user) => {
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const { data } = await getUserById(user._id);
      setDetailUser(data.data);
    } catch {
      showToast('Không thể tải chi tiết người dùng!', 'error');
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const handleOpenEdit = (user) => {
    setEditForm({
      _id: user._id,
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'customer',
      isEmailVerified: user.isEmailVerified ?? false,
    });
    setShowEdit(true);
  };

  // ── Submit edit ───────────────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUser(editForm._id, {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        role: editForm.role,
        isEmailVerified: editForm.isEmailVerified,
      });
      showToast('Cập nhật người dùng thành công!');
      setShowEdit(false);
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName || user.email}"?`)) return;
    try {
      await deleteUser(user._id);
      showToast('Xóa người dùng thành công!');
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa người dùng!', 'error');
    }
  };

  // ── Search handler ────────────────────────────────────────────────────────
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchUsers(1);
  };

  return (
    <div className="management-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <h2>Quản lý người dùng</h2>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon="bi-people-fill" color="#3498db" label="Tổng người dùng" value={stats.total} />
          <StatCard icon="bi-person-fill" color="#27ae60" label="Khách hàng" value={stats.customers} />
          <StatCard icon="bi-shield-fill" color="#e74c3c" label="Quản trị viên" value={stats.owners} />
          <StatCard icon="bi-patch-check-fill" color="#f39c12" label="Đã xác thực email" value={stats.verified} />
          <StatCard icon="bi-person-plus-fill" color="#9b59b6" label="Mới tháng này" value={stats.newThisMonth} />
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            placeholder="Tìm kiếm tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={{ width: '100%', paddingLeft: '36px', height: '40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ height: '40px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fff' }}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="owner">Quản trị viên</option>
        </select>
        <button
          onClick={() => fetchUsers(1)}
          style={{ height: '40px', padding: '0 18px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <i className="bi bi-funnel-fill" /> Lọc
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-people" />
          <p>Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Xác thực</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td style={{ color: '#888' }}>{(pagination.page - 1) * LIMIT + index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: user.role === 'owner' ? '#ffeaea' : '#eaf4ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {user.avatar
                          ? <img src={user.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          : <i className="bi bi-person-fill" style={{ color: user.role === 'owner' ? '#e74c3c' : '#3498db' }} />
                        }
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.fullName || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#555' }}>{user.email}</td>
                  <td>{user.phoneNumber || '—'}</td>
                  <td>
                    <span className={ROLE_CLASS[user.role] || 'role-badge'}>
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {user.isEmailVerified
                      ? <i className="bi bi-check-circle-fill" style={{ color: '#27ae60', fontSize: '18px' }} title="Đã xác thực" />
                      : <i className="bi bi-x-circle-fill" style={{ color: '#e74c3c', fontSize: '18px' }} title="Chưa xác thực" />
                    }
                  </td>
                  <td style={{ color: '#888', fontSize: '13px' }}>{formatDate(user.createdAt)}</td>
                  <td>
                    <button className="action-btn" style={{ background: '#eaf4ff', color: '#3498db' }} onClick={() => handleViewDetail(user)} title="Xem chi tiết">
                      <i className="bi bi-eye-fill" />
                    </button>
                    <button className="action-btn edit" onClick={() => handleOpenEdit(user)} title="Chỉnh sửa">
                      <i className="bi bi-pencil-square" />
                    </button>
                    {user.role !== 'owner' && (
                      <button className="action-btn delete" onClick={() => handleDelete(user)} title="Xóa">
                        <i className="bi bi-trash3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => fetchUsers(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={pageBtnStyle(pagination.page <= 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchUsers(p)}
              style={pageBtnStyle(false, p === pagination.page)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchUsers(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            style={pageBtnStyle(pagination.page >= pagination.totalPages)}
          >
            <i className="bi bi-chevron-right" />
          </button>
          <span style={{ color: '#888', fontSize: '13px', marginLeft: 8 }}>
            Tổng: {pagination.total} người dùng
          </span>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>👤 Chi tiết người dùng</h3>
              <button className="modal-close-btn" onClick={() => setShowDetail(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
              ) : detailUser ? (
                <div>
                  {/* Avatar + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: '#f8f9fa', borderRadius: 12 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: detailUser.role === 'owner' ? '#ffeaea' : '#eaf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {detailUser.avatar
                        ? <img src={detailUser.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <i className="bi bi-person-fill" style={{ fontSize: 28, color: detailUser.role === 'owner' ? '#e74c3c' : '#3498db' }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{detailUser.fullName || '—'}</div>
                      <span className={ROLE_CLASS[detailUser.role] || 'role-badge'} style={{ marginTop: 4 }}>
                        {ROLE_LABEL[detailUser.role] || detailUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Info rows */}
                  {[
                    { icon: 'bi-envelope-fill', label: 'Email', value: detailUser.email },
                    { icon: 'bi-telephone-fill', label: 'Số điện thoại', value: detailUser.phoneNumber || '—' },
                    { icon: 'bi-calendar-fill', label: 'Ngày sinh', value: formatDate(detailUser.dob) },
                    { icon: 'bi-calendar-plus-fill', label: 'Ngày tạo', value: formatDate(detailUser.createdAt) },
                    { icon: 'bi-bag-check-fill', label: 'Số đơn hàng', value: detailUser.orderCount ?? '—' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <i className={`bi ${icon}`} style={{ width: 24, color: '#e74c3c', marginRight: 12 }} />
                      <span style={{ color: '#888', width: 130, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}

                  {/* Email verified */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
                    <i className="bi bi-patch-check-fill" style={{ width: 24, color: '#e74c3c', marginRight: 12 }} />
                    <span style={{ color: '#888', width: 130, flexShrink: 0 }}>Xác thực email</span>
                    {detailUser.isEmailVerified
                      ? <span style={{ color: '#27ae60', fontWeight: 600 }}><i className="bi bi-check-circle-fill" /> Đã xác thực</span>
                      : <span style={{ color: '#e74c3c', fontWeight: 600 }}><i className="bi bi-x-circle-fill" /> Chưa xác thực</span>
                    }
                  </div>
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetail(false)}>Đóng</button>
              {detailUser && detailUser.role !== 'owner' && (
                <button className="btn-submit" onClick={() => { setShowDetail(false); handleOpenEdit(detailUser); }}>
                  <i className="bi bi-pencil-square" /> Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>✏️ Chỉnh sửa người dùng</h3>
              <button className="modal-close-btn" onClick={() => setShowEdit(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Nhập họ và tên..."
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    placeholder="VD: 0901234567"
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="owner">Quản trị viên</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="emailVerified"
                    checked={editForm.isEmailVerified}
                    onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="emailVerified" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Đã xác thực email
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon, color, label, value }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2c3e50', lineHeight: 1.2 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function pageBtnStyle(disabled, active = false) {
  return {
    width: 36, height: 36,
    border: active ? '2px solid #e74c3c' : '1px solid #ddd',
    borderRadius: 8,
    background: active ? '#e74c3c' : '#fff',
    color: active ? '#fff' : disabled ? '#bbb' : '#333',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: active ? 700 : 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

export default UserManagementPage;
