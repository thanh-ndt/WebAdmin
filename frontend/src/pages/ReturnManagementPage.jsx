import { useState, useEffect, useCallback } from 'react';
import {
  getReturnStats,
  getReturnRequests,
  updateReturnStatus,
  getOrderById,
} from '../api/adminApi';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: '#f39c12', bg: '#fff8e6', icon: 'bi-hourglass-split' },
  approved: { label: 'Đã chấp nhận', color: '#27ae60', bg: '#eafaf1', icon: 'bi-check-circle-fill' },
  rejected: { label: 'Đã từ chối', color: '#e74c3c', bg: '#ffeaea', icon: 'bi-x-circle-fill' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatCurrency(amount) {
  if (amount == null) return '—';
  return amount.toLocaleString('vi-VN') + ' ₫';
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
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2c3e50', lineHeight: 1.2 }}>
          {value == null ? '—' : value}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function ReturnManagementPage() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const LIMIT = 10;

  const [detailData, setDetailData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const { data } = await getReturnStats();
      setStats(data.data);
    } catch {
      // silent err
    }
  };

  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getReturnRequests({
        page, limit: LIMIT,
        status: statusFilter,
        searchTerm: search.trim()
      });
      setRequests(data.data);
      setPagination({ page: data.page, totalPages: data.pages, total: data.total });
    } catch (error) {
      showToast('Không thể tải danh sách trả hàng!', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    const isApproved = newStatus === 'approved';
    const msg = isApproved ? 'Bạn có chắc chắn chấp nhận yêu cầu trả hàng này?' : 'Bạn có chắc chắn từ chối yêu cầu trả hàng này?';
    if (!window.confirm(msg)) return;

    try {
      await updateReturnStatus(id, newStatus);
      showToast(`Đã ${isApproved ? 'chấp nhận' : 'từ chối'} yêu cầu thành công!`);
      fetchRequests(pagination.page);
      fetchStats();
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi cập nhật trạng thái', 'error');
    }
  };

  const handleViewDetail = async (req) => {
    setShowDetail(true);
    setDetailLoading(true);
    setDetailData({ request: req, orderDetail: null });

    // fetch thêm order details (nếu order vẫn còn tồn tại trong req)
    try {
      if (req.order && req.order._id) {
        const { data } = await getOrderById(req.order._id);
        setDetailData({ request: req, orderDetail: data });
      }
    } catch (error) {
      console.error("Fetch order detail error", error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Quản lý trả hàng</h2>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard icon="bi-bezier" color="#3498db" label="Tổng yêu cầu" value={stats.total} />
          <StatCard icon="bi-hourglass-split" color="#f39c12" label="Chờ xử lý" value={stats.pending} />
          <StatCard icon="bi-check-circle-fill" color="#27ae60" label="Đã chấp nhận" value={stats.approved} />
          <StatCard icon="bi-x-circle-fill" color="#e74c3c" label="Đã từ chối" value={stats.rejected} />
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRequests(1)}
              style={{ width: '100%', paddingLeft: 36, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, outline: 'none' }}
            />
          </div>
          <button onClick={() => fetchRequests(1)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '0 20px', fontWeight: 600 }}>
            Tìm kiếm
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#888', marginRight: 2, alignSelf: 'center' }}>Trạng thái:</span>
          <button
            onClick={() => setStatusFilter('')}
            style={{ height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: statusFilter === '' ? '2px solid #2c3e50' : '1.5px solid #ddd', background: statusFilter === '' ? '#2c3e50' : '#fff', color: statusFilter === '' ? '#fff' : '#666' }}
          >Tất cả</button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{ height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: active ? `2px solid ${cfg.color}` : '1.5px solid #ddd', background: active ? cfg.color : cfg.bg, color: active ? '#fff' : cfg.color }}
              >
                <i className={`bi ${cfg.icon} me-1`} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox" />
          <p>Không có yêu cầu trả hàng nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Mã đơn hàng</th>
                <th>Lý do</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => {
                const customer = req.order?.customer;
                return (
                  <tr key={req._id}>
                    <td style={{ color: '#888' }}>{(pagination.page - 1) * LIMIT + index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{customer?.fullName || '—'}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{customer?.phoneNumber || ''}</div>
                    </td>
                    <td style={{ fontSize: 13, color: '#555' }}>
                      {req.order?._id || '—'}
                    </td>
                    <td style={{ fontSize: 13, color: '#333', maxWidth: 200, WebkitLineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                      {req.reason}
                    </td>
                    <td style={{ fontSize: 13, color: '#555' }}>{formatDate(req.createdAt)}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: STATUS_CONFIG[req.status].bg, color: STATUS_CONFIG[req.status].color }}>
                        {STATUS_CONFIG[req.status].label}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" style={{ background: '#eaf4ff', color: '#3498db', marginRight: 8 }} onClick={() => handleViewDetail(req)} title="Chi tiết">
                        <i className="bi bi-eye-fill" />
                      </button>
                      {req.status === 'pending' && (
                        <>
                          <button className="action-btn" style={{ background: '#eafaf1', color: '#27ae60', marginRight: 8 }} onClick={() => handleStatusChange(req._id, 'approved')} title="Chấp nhận">
                            <i className="bi bi-check-lg" />
                          </button>
                          <button className="action-btn" style={{ background: '#ffeaea', color: '#e74c3c' }} onClick={() => handleStatusChange(req._id, 'rejected')} title="Từ chối">
                            <i className="bi bi-x-lg" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => fetchRequests(pagination.page - 1)} disabled={pagination.page <= 1} style={pageBtnStyle(pagination.page <= 1)}><i className="bi bi-chevron-left" /></button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            // simplified pagination logic
            let start = Math.max(1, pagination.page - 2);
            if (start + 4 > pagination.totalPages) start = Math.max(1, pagination.totalPages - 4);
            return start + i;
          }).map(p => (
            <button key={p} onClick={() => fetchRequests(p)} style={pageBtnStyle(false, p === pagination.page)}>{p}</button>
          ))}
          <button onClick={() => fetchRequests(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} style={pageBtnStyle(pagination.page >= pagination.totalPages)}><i className="bi bi-chevron-right" /></button>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetail && detailData && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3><i className="bi bi-info-circle me-2"></i> Chi tiết yêu cầu trả hàng</h3>
              <button className="modal-close-btn" onClick={() => setShowDetail(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : (
                <div>
                  <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ marginBottom: 10 }}><strong>Lý do trả hàng:</strong> <span style={{ color: '#e74c3c' }}>{detailData.request.reason}</span></div>
                    <div><strong>Trạng thái:</strong> <span style={{ color: STATUS_CONFIG[detailData.request.status].color, fontWeight: 'bold' }}>{STATUS_CONFIG[detailData.request.status].label}</span></div>
                    <div style={{ marginTop: 10 }}><strong>Ngày yêu cầu:</strong> {new Date(detailData.request.createdAt).toLocaleString('vi-VN')}</div>
                  </div>

                  {detailData.orderDetail && (
                    <div>
                      <h5 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 12 }}>Thông tin đơn hàng gốc</h5>
                      <div style={{ fontSize: 14 }}>
                        <p><strong>Mã đơn:</strong> {detailData.orderDetail.order._id}</p>
                        <p><strong>Tổng tiền:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatCurrency(detailData.orderDetail.order.totalAmount)}</span></p>
                        <p><strong>Trạng thái giao hàng:</strong> {detailData.orderDetail.order.status}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {detailData.request.status === 'pending' && (
                <>
                  <button className="btn btn-success" onClick={() => { handleStatusChange(detailData.request._id, 'approved'); setShowDetail(false); }}><i className="bi bi-check-lg me-1" /> Chấp nhận</button>
                  <button className="btn btn-danger" onClick={() => { handleStatusChange(detailData.request._id, 'rejected'); setShowDetail(false); }}><i className="bi bi-x-lg me-1" /> Từ chối</button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

export default ReturnManagementPage;
