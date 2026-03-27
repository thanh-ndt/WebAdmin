import { useState, useEffect, useCallback } from 'react';
import {
  getOrderStats,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../api/adminApi';

const STATUS_CONFIG = {
  pending:   { label: 'Chờ xác nhận', color: '#f39c12', bg: '#fff8e6', icon: 'bi-hourglass-split' },
  confirmed: { label: 'Đã xác nhận',  color: '#3498db', bg: '#eaf4ff', icon: 'bi-check-circle'   },
  shipping:  { label: 'Đang giao',    color: '#9b59b6', bg: '#f5eeff', icon: 'bi-truck'           },
  delivered: { label: 'Đã giao',      color: '#27ae60', bg: '#eafaf1', icon: 'bi-bag-check-fill'  },
  cancelled: { label: 'Đã hủy',       color: '#e74c3c', bg: '#ffeaea', icon: 'bi-x-circle'        },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(amount) {
  if (amount == null) return '—';
  return amount.toLocaleString('vi-VN') + ' ₫';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon, color, label, value, isCurrency }) {
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
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
      </div>
      <div>
        <div style={{ fontSize: isCurrency ? 16 : 22, fontWeight: 700, color: '#2c3e50', lineHeight: 1.2 }}>
          {value == null ? '—' : isCurrency ? formatCurrency(value) : value}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#888', bg: '#f5f5f5' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
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

// ── Main Page ───────────────────────────────────────────────────────────────

function OrderManagementPage() {
  const [stats, setStats] = useState(null);

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const LIMIT = 10;

  const [detailData, setDetailData]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail]     = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const { data } = await getOrderStats();
      setStats(data);
    } catch {
      // silent
    }
  };

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getOrders({
        page, limit: LIMIT,
        status: statusFilter,
        search: search.trim(),
      });
      setOrders(data.orders);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch {
      showToast('Không thể tải danh sách đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  // ── View detail ───────────────────────────────────────────────────────────
  const handleViewDetail = async (order) => {
    setShowDetail(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const { data } = await getOrderById(order._id);
      setDetailData(data);
    } catch {
      showToast('Không thể tải chi tiết đơn hàng!', 'error');
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Update status ─────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      showToast(`Đã cập nhật: "${STATUS_CONFIG[newStatus]?.label}"`);
      fetchOrders(pagination.page);
      fetchStats();
    } catch {
      showToast('Lỗi cập nhật trạng thái!', 'error');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (order) => {
    if (!window.confirm(`Xóa đơn hàng của "${order.customer?.fullName || 'khách hàng'}"?`)) return;
    try {
      await deleteOrder(order._id);
      showToast('Xóa đơn hàng thành công!');
      fetchOrders(pagination.page);
      fetchStats();
    } catch {
      showToast('Lỗi xóa đơn hàng!', 'error');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchOrders(1);
  };

  return (
    <div className="management-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <h2>🛒 Quản lý đơn hàng</h2>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          <StatCard icon="bi-bag-fill"          color="#3498db" label="Tổng đơn hàng"  value={stats.total} />
          <StatCard icon="bi-hourglass-split"   color="#f39c12" label="Chờ xác nhận"   value={stats.pending} />
          <StatCard icon="bi-check-circle-fill" color="#3498db" label="Đã xác nhận"    value={stats.confirmed} />
          <StatCard icon="bi-truck"             color="#9b59b6" label="Đang giao"       value={stats.shipping} />
          <StatCard icon="bi-bag-check-fill"    color="#27ae60" label="Đã giao"         value={stats.delivered} />
          <StatCard icon="bi-x-circle-fill"     color="#e74c3c" label="Đã hủy"          value={stats.cancelled} />
          <StatCard icon="bi-currency-exchange" color="#16a085" label="Doanh thu"       value={stats.revenue} isCurrency />
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div style={{ marginBottom: 20 }}>
        {/* Row 1: Search + button */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="bi bi-search" style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#aaa', fontSize: 14,
            }} />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 12, height: 40,
                border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            onClick={() => fetchOrders(1)}
            style={{
              height: 40, padding: '0 20px', flexShrink: 0,
              background: '#e74c3c', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <i className="bi bi-search" /> Tìm kiếm
          </button>
        </div>

        {/* Row 2: Status pill filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888', marginRight: 2, flexShrink: 0 }}>
            Trạng thái:
          </span>

          {/* All */}
          <button
            onClick={() => setStatusFilter('')}
            style={{
              height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13,
              fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              border: statusFilter === ''
                ? '2px solid #2c3e50'
                : '1.5px solid #ddd',
              background: statusFilter === '' ? '#2c3e50' : '#fff',
              color: statusFilter === '' ? '#fff' : '#666',
            }}
          >
            Tất cả
          </button>

          {Object.entries(STATUS_CONFIG).map(([key, { label, color, bg, icon }]) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  border: active ? `2px solid ${color}` : '1.5px solid #e0e0e0',
                  background: active ? color : bg,
                  color: active ? '#fff' : color,
                  boxShadow: active ? `0 2px 8px ${color}44` : 'none',
                }}
              >
                <i className={`bi ${icon}`} style={{ fontSize: 12 }} />
                {label}
                {stats && stats[key] !== undefined && (
                  <span style={{
                    marginLeft: 2,
                    background: active ? 'rgba(255,255,255,0.3)' : color + '22',
                    color: active ? '#fff' : color,
                    borderRadius: 10, fontSize: 11, fontWeight: 700,
                    padding: '1px 6px', lineHeight: '16px',
                  }}>
                    {stats[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bag-x" />
          <p>Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Địa chỉ giao</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td style={{ color: '#888' }}>
                    {(pagination.page - 1) * LIMIT + index + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: '#eaf4ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        overflow: 'hidden',
                      }}>
                        {order.customer?.avatar
                          ? <img src={order.customer.avatar} alt="" style={{ width: 34, height: 34, objectFit: 'cover' }} />
                          : <i className="bi bi-person-fill" style={{ color: '#3498db' }} />
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {order.customer?.fullName || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {order.customer?.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                    {formatDate(order.orderDate || order.createdAt)}
                  </td>
                  <td style={{ fontWeight: 700, color: '#e74c3c', whiteSpace: 'nowrap' }}>
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td style={{
                    maxWidth: 180, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    fontSize: 13, color: '#555',
                  }} title={order.shippingAddress}>
                    {order.shippingAddress || '—'}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      style={{
                        border: `1px solid ${STATUS_CONFIG[order.status]?.color || '#ddd'}`,
                        color: STATUS_CONFIG[order.status]?.color || '#333',
                        background: STATUS_CONFIG[order.status]?.bg || '#fff',
                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                        padding: '4px 8px', cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      style={{ background: '#eaf4ff', color: '#3498db' }}
                      onClick={() => handleViewDetail(order)}
                      title="Xem chi tiết"
                    >
                      <i className="bi bi-eye-fill" />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(order)}
                      title="Xóa đơn hàng"
                    >
                      <i className="bi bi-trash3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center',
          alignItems: 'center', gap: 8, marginTop: 20,
        }}>
          <button
            onClick={() => fetchOrders(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={pageBtnStyle(pagination.page <= 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchOrders(p)}
              style={pageBtnStyle(false, p === pagination.page)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchOrders(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            style={pageBtnStyle(pagination.page >= pagination.totalPages)}
          >
            <i className="bi bi-chevron-right" />
          </button>
          <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
            Tổng: {pagination.total} đơn hàng
          </span>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="modal-header">
              <h3>🛒 Chi tiết đơn hàng</h3>
              <button className="modal-close-btn" onClick={() => setShowDetail(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : detailData ? (
                <div>
                  {/* Customer info */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 16, background: '#f8f9fa', borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: '#eaf4ff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, overflow: 'hidden',
                    }}>
                      {detailData.order.customer?.avatar
                        ? <img src={detailData.order.customer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <i className="bi bi-person-fill" style={{ fontSize: 24, color: '#3498db' }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {detailData.order.customer?.fullName || '—'}
                      </div>
                      <div style={{ fontSize: 13, color: '#888' }}>
                        {detailData.order.customer?.email || ''}
                        {detailData.order.customer?.phoneNumber ? ` · ${detailData.order.customer.phoneNumber}` : ''}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <StatusBadge status={detailData.order.status} />
                    </div>
                  </div>

                  {/* Order meta */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 20 }}>
                    {[
                      { icon: 'bi-calendar-fill',    label: 'Ngày đặt',         value: formatDateTime(detailData.order.orderDate || detailData.order.createdAt) },
                      { icon: 'bi-geo-alt-fill',      label: 'Địa chỉ giao',     value: detailData.order.shippingAddress },
                      { icon: 'bi-tag-fill',          label: 'Mã khuyến mãi',    value: detailData.order.promotion?.code || '—' },
                      { icon: 'bi-cash-coin',         label: 'Tổng tiền',        value: formatCurrency(detailData.order.totalAmount), highlight: true },
                    ].map(({ icon, label, value, highlight }) => (
                      <div key={label} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 12px', background: '#fafafa',
                        borderRadius: 8, border: '1px solid #f0f0f0',
                      }}>
                        <i className={`bi ${icon}`} style={{ color: '#e74c3c', marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
                          <div style={{ fontWeight: highlight ? 700 : 500, color: highlight ? '#e74c3c' : '#2c3e50', marginTop: 2 }}>
                            {value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order items */}
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
                      <i className="bi bi-list-ul" style={{ marginRight: 6, color: '#e74c3c' }} />
                      Sản phẩm trong đơn
                    </div>
                    {detailData.details.length === 0 ? (
                      <p style={{ color: '#888', fontSize: 14 }}>Không có sản phẩm nào.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ background: '#f8f9fa' }}>
                            <th style={thStyle}>Tên xe</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>SL</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Đơn giá</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.details.map((item) => (
                            <tr key={item._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {item.vehicle?.images?.[0] && (
                                    <img
                                      src={item.vehicle.images[0]}
                                      alt=""
                                      style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                                    />
                                  )}
                                  <span style={{ fontWeight: 500 }}>{item.vehicle?.name || '—'}</span>
                                </div>
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#e74c3c', whiteSpace: 'nowrap' }}>
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} style={{ ...tdStyle, fontWeight: 700, textAlign: 'right', color: '#2c3e50' }}>
                              Tổng cộng:
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right', color: '#e74c3c', fontSize: 16 }}>
                              {formatCurrency(detailData.order.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>

                  {/* Change status inside modal */}
                  <div style={{ marginTop: 20, padding: '14px 16px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                    <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>
                      <i className="bi bi-arrow-repeat" style={{ marginRight: 6, color: '#e74c3c' }} />
                      Cập nhật trạng thái đơn hàng
                    </label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {Object.entries(STATUS_CONFIG).map(([key, { label, color, bg }]) => (
                        <button
                          key={key}
                          onClick={async () => {
                            await handleStatusChange(detailData.order._id, key);
                            setDetailData((prev) => prev ? { ...prev, order: { ...prev.order, status: key } } : prev);
                          }}
                          style={{
                            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: `2px solid ${detailData.order.status === key ? color : '#e0e0e0'}`,
                            background: detailData.order.status === key ? bg : '#fff',
                            color: detailData.order.status === key ? color : '#888',
                            cursor: 'pointer', transition: 'all .15s',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
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

const thStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 13,
  color: '#555',
  borderBottom: '2px solid #e8e8e8',
};

const tdStyle = {
  padding: '10px 10px',
  verticalAlign: 'middle',
};

export default OrderManagementPage;
