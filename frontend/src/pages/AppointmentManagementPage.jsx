import { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus, deleteAppointment, getAppointmentStats } from '../api/adminApi';
import StatsHeader from '../components/StatsHeader';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [page, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await getAppointments({ page, limit: 10, status: filterStatus });
      setAppointments(data.appointments);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      showToast(`Đã cập nhật trạng thái thành "${STATUS_LABELS[newStatus]}"`);
      fetchAppointments();
    } catch (error) {
      showToast('Lỗi cập nhật trạng thái!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
    try {
      await deleteAppointment(id);
      showToast('Xóa lịch hẹn thành công!');
      fetchAppointments();
    } catch (error) {
      showToast('Lỗi xóa lịch hẹn!', 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>📅 Quản lý lịch hẹn</h2>
      </div>

      <StatsHeader 
        fetchFn={getAppointmentStats} 
        cards={[
          { key: 'total',     label: 'Tổng lịch hẹn',  icon: 'bi-calendar-fill',   color: '#3498db' },
          { key: 'pending',   label: 'Chờ xác nhận',   icon: 'bi-hourglass-split', color: '#f39c12' },
          { key: 'confirmed', label: 'Đã xác nhận',    icon: 'bi-check-circle',    color: '#3498db' },
          { key: 'completed', label: 'Hoàn thành',    icon: 'bi-calendar-check',   color: '#27ae60' },
          { key: 'cancelled', label: 'Đã hủy',         icon: 'bi-x-circle',        color: '#e74c3c' },
        ]} 
      />

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm lịch hẹn..."
          disabled
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-calendar-x"></i>
          <p>Chưa có lịch hẹn nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Ngày hẹn</th>
                <th>Khung giờ</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt._id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {apt.customer?.fullName || apt.guestName || 'Khách'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {apt.customer?.phone || apt.guestPhone || ''}
                      </div>
                    </div>
                  </td>
                  <td>{apt.vehicle?.name || 'N/A'}</td>
                  <td>{formatDate(apt.appointmentDate)}</td>
                  <td>{apt.timeSlot}</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {apt.note || '-'}
                  </td>
                  <td>
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                      className={`badge-status badge-${apt.status}`}
                      style={{ border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 20 }}
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="action-btn delete" onClick={() => handleDelete(apt._id)} title="Xóa">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-bar">
            <span className="pagination-info">
              Hiển thị {appointments.length} / {total} lịch hẹn
            </span>
            <div className="pagination-buttons">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AppointmentManagementPage;
