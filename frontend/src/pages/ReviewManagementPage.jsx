import { useState, useEffect, useCallback } from 'react';
import { getReviewStats, getReviews, deleteReview } from '../api/adminApi';

const RATING_COLORS = {
  5: '#27ae60',
  4: '#2ecc71',
  3: '#f39c12',
  2: '#e67e22',
  1: '#e74c3c',
};

function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={s <= rating ? 'bi bi-star-fill' : 'bi bi-star'}
          style={{ fontSize: size, color: s <= rating ? '#f1c40f' : '#ddd' }}
        />
      ))}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
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

// ── Stats Overview Card ─────────────────────────────────────────────────────

function OverviewCard({ stats }) {
  const maxCount = Math.max(...Object.values(stats.distribution));

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      padding: '24px 28px', marginBottom: 24,
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '0 40px', alignItems: 'center',
    }}>
      {/* Average score */}
      <div style={{ textAlign: 'center', minWidth: 110 }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: '#2c3e50', lineHeight: 1 }}>
          {stats.avgRating.toFixed(1)}
        </div>
        <StarRating rating={Math.round(stats.avgRating)} size={18} />
        <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
          {stats.total} đánh giá
        </div>
      </div>

      {/* Distribution bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star] || 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#666', width: 14, textAlign: 'right', flexShrink: 0 }}>{star}</span>
              <i className="bi bi-star-fill" style={{ fontSize: 11, color: '#f1c40f', flexShrink: 0 }} />
              <div style={{
                flex: 1, height: 8, background: '#f0f0f0',
                borderRadius: 4, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: RATING_COLORS[star],
                  borderRadius: 4, transition: 'width .4s ease',
                }} />
              </div>
              <span style={{ fontSize: 12, color: '#888', width: 24, textAlign: 'right', flexShrink: 0 }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick stat badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 140 }}>
        {[
          { label: 'Xuất sắc (5★)', key: 5, color: '#27ae60' },
          { label: 'Tốt (4★)',       key: 4, color: '#2ecc71' },
          { label: 'Trung bình (3★)',key: 3, color: '#f39c12' },
          { label: 'Kém (1-2★)',     key: null, color: '#e74c3c' },
        ].map(({ label, key, color }) => {
          const count = key !== null
            ? (stats.distribution[key] || 0)
            : (stats.distribution[1] || 0) + (stats.distribution[2] || 0);
          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
              <span style={{
                fontSize: 12, fontWeight: 700, color,
                background: color + '18', borderRadius: 8,
                padding: '2px 8px',
              }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

function ReviewManagementPage() {
  const [stats, setStats]         = useState(null);
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [detailReview, setDetailReview] = useState(null);
  const [toast, setToast]         = useState(null);
  const LIMIT = 10;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const { data } = await getReviewStats();
      setStats(data);
    } catch { /* silent */ }
  };

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

  const handleDelete = async (review) => {
    if (!window.confirm(`Xóa đánh giá của "${review.customer?.fullName || 'khách hàng'}"?`)) return;
    try {
      await deleteReview(review._id);
      showToast('Xóa đánh giá thành công!');
      setDetailReview(null);
      fetchReviews(pagination.page);
      fetchStats();
    } catch {
      showToast('Lỗi khi xóa đánh giá!', 'error');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchReviews(1);
  };

  return (
    <div className="management-page">

      {/* ── Header ── */}
      <div className="page-header">
        <h2>⭐ Quản lý đánh giá</h2>
      </div>

      {/* ── Overview stats card ── */}
      {stats && <OverviewCard stats={stats} />}

      {/* ── Filter Bar ── */}
      <div style={{ marginBottom: 20 }}>
        {/* Row 1: Search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="bi bi-search" style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#aaa', fontSize: 14,
            }} />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng, email hoặc tên xe..."
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

        {/* Row 2: Star rating filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888', marginRight: 2, flexShrink: 0 }}>
            Số sao:
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
          {[5, 4, 3, 2, 1].map((star) => {
            const active = ratingFilter === String(star);
            const color = RATING_COLORS[star];
            const count = stats?.distribution?.[star] ?? null;
            return (
              <button
                key={star}
                onClick={() => setRatingFilter(String(star))}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 20, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  border: active ? `2px solid ${color}` : '1.5px solid #e0e0e0',
                  background: active ? color : color + '12',
                  color: active ? '#fff' : color,
                  boxShadow: active ? `0 2px 8px ${color}44` : 'none',
                }}
              >
                <i className="bi bi-star-fill" style={{ fontSize: 11 }} />
                {star} sao
                {count !== null && (
                  <span style={{
                    marginLeft: 2,
                    background: active ? 'rgba(255,255,255,0.28)' : color + '22',
                    color: active ? '#fff' : color,
                    borderRadius: 10, fontSize: 11, fontWeight: 700,
                    padding: '1px 6px', lineHeight: '16px',
                  }}>
                    {count}
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
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-star" />
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
                <th>Nội dung</th>
                <th>Ngày đăng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr key={review._id}>
                  <td style={{ color: '#888', fontSize: 13 }}>
                    {(pagination.page - 1) * LIMIT + index + 1}
                  </td>

                  {/* Customer */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: '#eaf4ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
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
                        <div style={{ fontSize: 12, color: '#aaa' }}>
                          {review.customer?.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {review.vehicle?.images?.[0] ? (
                        <img
                          src={review.vehicle.images[0]}
                          alt=""
                          style={{ width: 38, height: 34, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 38, height: 34, borderRadius: 6, flexShrink: 0,
                          background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="bi bi-bicycle" style={{ color: '#ccc' }} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{review.vehicle?.name || '—'}</div>
                        {review.vehicle?.category && (
                          <div style={{ fontSize: 11, color: '#aaa' }}>{review.vehicle.category}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <StarRating rating={review.rating} size={13} />
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: RATING_COLORS[review.rating] || '#888',
                      }}>
                        {review.rating}/5
                      </span>
                    </div>
                  </td>

                  {/* Comment */}
                  <td style={{ maxWidth: 220 }}>
                    {review.comment ? (
                      <span
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: 13, color: '#444', lineHeight: 1.5,
                          cursor: 'pointer',
                        }}
                        title={review.comment}
                        onClick={() => setDetailReview(review)}
                      >
                        {review.comment}
                      </span>
                    ) : (
                      <span style={{ color: '#ccc', fontSize: 12 }}>Không có nội dung</span>
                    )}
                  </td>

                  {/* Date */}
                  <td style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>
                    {formatDate(review.postedDate || review.createdAt)}
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      className="action-btn"
                      style={{ background: '#eaf4ff', color: '#3498db' }}
                      onClick={() => setDetailReview(review)}
                      title="Xem chi tiết"
                    >
                      <i className="bi bi-eye-fill" />
                    </button>
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

      {/* ── Detail Modal ── */}
      {detailReview && (
        <div className="modal-overlay" onClick={() => setDetailReview(null)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520 }}
          >
            <div className="modal-header">
              <h3>⭐ Chi tiết đánh giá</h3>
              <button className="modal-close-btn" onClick={() => setDetailReview(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              {/* Customer info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 16, background: '#f8f9fa', borderRadius: 12, marginBottom: 18,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#eaf4ff', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {detailReview.customer?.avatar
                    ? <img src={detailReview.customer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="bi bi-person-fill" style={{ fontSize: 24, color: '#3498db' }} />
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {detailReview.customer?.fullName || '—'}
                  </div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {detailReview.customer?.email}
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: '#fafafa',
                border: '1px solid #f0f0f0', borderRadius: 10, marginBottom: 18,
              }}>
                {detailReview.vehicle?.images?.[0] ? (
                  <img
                    src={detailReview.vehicle.images[0]}
                    alt=""
                    style={{ width: 56, height: 46, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 56, height: 46, borderRadius: 8, flexShrink: 0,
                    background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="bi bi-bicycle" style={{ fontSize: 20, color: '#ccc' }} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {detailReview.vehicle?.name || '—'}
                  </div>
                  {detailReview.vehicle?.category && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {detailReview.vehicle.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Rating + Date */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <StarRating rating={detailReview.rating} size={20} />
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: RATING_COLORS[detailReview.rating],
                  }}>
                    {detailReview.rating} / 5 sao
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: '#888' }}>
                  <i className="bi bi-calendar3" style={{ marginRight: 5 }} />
                  {formatDate(detailReview.postedDate || detailReview.createdAt)}
                </div>
              </div>

              {/* Comment */}
              <div style={{
                padding: '14px 16px', background: '#fffbf0',
                border: '1px solid #fde8a0', borderRadius: 10,
                fontSize: 14, color: '#444', lineHeight: 1.7,
                minHeight: 60,
              }}>
                <i className="bi bi-chat-quote-fill" style={{ color: '#f1c40f', marginRight: 8 }} />
                {detailReview.comment || <span style={{ color: '#aaa' }}>Không có nội dung đánh giá.</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDetailReview(null)}>Đóng</button>
              <button
                className="action-btn delete"
                style={{ padding: '0 18px', height: 38, borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => handleDelete(detailReview)}
              >
                <i className="bi bi-trash3" /> Xóa đánh giá
              </button>
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

export default ReviewManagementPage;
