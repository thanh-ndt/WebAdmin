import { useState, useEffect, useCallback } from 'react';
import {
  getReviewStats,
  getReviews,
  deleteReview,
} from '../api/adminApi';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2, color: '#f39c12', fontSize: 14 }}>
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`} />
      ))}
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

// ── Main Page ───────────────────────────────────────────────────────────────

function ReviewManagementPage() {
  const [stats, setStats] = useState(null);

  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const LIMIT = 10;

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const { data } = await getReviewStats();
      setStats(data);
    } catch {
      // silent
    }
  };

  // ── Fetch reviews ──────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getReviews({
        page, limit: LIMIT,
        rating: ratingFilter,
        search: search.trim(),
      });
      setReviews(data.reviews);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch {
      showToast('Không thể tải danh sách đánh giá!', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, ratingFilter]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (review) => {
    if (!window.confirm(`Xóa đánh giá này?`)) return;
    try {
      await deleteReview(review._id);
      showToast('Xóa đánh giá thành công!');
      fetchReviews(pagination.page);
      fetchStats();
    } catch {
      showToast('Lỗi xóa đánh giá!', 'error');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchReviews(1);
  };

  return (
    <div className="management-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <h2>⭐ Quản lý đánh giá</h2>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          <StatCard icon="bi-chat-heart-fill" color="#3498db" label="Tổng đánh giá" value={stats.total} />
          <StatCard icon="bi-star-fill"       color="#f39c12" label="Điểm TB"       value={stats.avgRating ? stats.avgRating + ' / 5' : '0'} />
          <StatCard icon="bi-5-square-fill"   color="#27ae60" label="5 Sao"         value={stats.distribution?.[5] || 0} />
          <StatCard icon="bi-4-square-fill"   color="#3498db" label="4 Sao"         value={stats.distribution?.[4] || 0} />
          <StatCard icon="bi-3-square-fill"   color="#f1c40f" label="3 Sao"         value={stats.distribution?.[3] || 0} />
          <StatCard icon="bi-2-square-fill"   color="#e67e22" label="2 Sao"         value={stats.distribution?.[2] || 0} />
          <StatCard icon="bi-1-square-fill"   color="#e74c3c" label="1 Sao"         value={stats.distribution?.[1] || 0} />
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
              placeholder="Tìm theo tên khách hàng, email, hoặc tên xe..."
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
            onClick={() => fetchReviews(1)}
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
            Lọc theo sao:
          </span>

          <button
            onClick={() => setRatingFilter('')}
            style={{
              height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13,
              fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              border: ratingFilter === '' ? '2px solid #2c3e50' : '1.5px solid #ddd',
              background: ratingFilter === '' ? '#2c3e50' : '#fff',
              color: ratingFilter === '' ? '#fff' : '#666',
            }}
          >
            Tất cả
          </button>

          {[5, 4, 3, 2, 1].map((rating) => {
            const active = ratingFilter === String(rating);
            const color = '#f39c12';
            return (
              <button
                key={rating}
                onClick={() => setRatingFilter(String(rating))}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  border: active ? `2px solid ${color}` : '1.5px solid #e0e0e0',
                  background: active ? color : '#fff',
                  color: active ? '#fff' : color,
                  boxShadow: active ? `0 2px 8px ${color}44` : 'none',
                }}
              >
                {rating} Sao
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-chat-square-x" />
          <p>Không tìm thấy đánh giá nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Đánh giá</th>
                <th>Ngày đăng</th>
                <th style={{ minWidth: 200 }}>Bình luận</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr key={review._id}>
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
                        {review.customer?.avatar
                          ? <img src={review.customer.avatar} alt="" style={{ width: 34, height: 34, objectFit: 'cover' }} />
                          : <i className="bi bi-person-fill" style={{ color: '#3498db' }} />
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {review.customer?.fullName || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {review.customer?.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {review.vehicle?.images?.[0] && (
                        <img
                          src={review.vehicle.images[0]}
                          alt=""
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                        />
                      )}
                      <span style={{ fontWeight: 500, fontSize: 13, color: '#333' }}>
                        {review.vehicle?.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StarRating rating={review.rating} />
                  </td>
                  <td style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                    {formatDate(review.postedDate || review.createdAt)}
                  </td>
                  <td style={{ fontSize: 13, color: '#444', maxWidth: 300, whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {review.comment}
                  </td>
                  <td>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(review)}
                      title="Xóa đánh giá"
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
            onClick={() => fetchReviews(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={pageBtnStyle(pagination.page <= 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchReviews(p)}
              style={pageBtnStyle(false, p === pagination.page)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchReviews(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            style={pageBtnStyle(pagination.page >= pagination.totalPages)}
          >
            <i className="bi bi-chevron-right" />
          </button>
          <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
            Tổng: {pagination.total} đánh giá
          </span>
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

export default ReviewManagementPage;
