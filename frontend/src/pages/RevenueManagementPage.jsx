import { useState, useEffect } from 'react';
import { getMonthlyRevenue, getRevenueDetails } from '../api/adminApi';
import { Modal, Button, Table } from 'react-bootstrap';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function RevenueManagementPage() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMonthlyRevenue();
  }, []);

  const fetchMonthlyRevenue = async () => {
    try {
      const { data } = await getMonthlyRevenue();
      setMonthlyData(data);
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu tháng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (year, month) => {
    setSelectedMonth({ year, month });
    setShowModal(true);
    setLoadingDetails(true);
    try {
      const { data } = await getRevenueDetails(year, month);
      setDetails(data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết doanh thu:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const calculateTotalRevenue = () => {
    return monthlyData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="revenue-page">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📊 Quản lý doanh thu</h2>
          <p className="text-muted mb-0">Theo dõi và phân tích doanh thu bán hàng theo thời gian.</p>
        </div>
        <div className="total-revenue-badge p-3 bg-white border rounded shadow-sm text-end">
          <small className="text-muted d-block mb-1">Tổng doanh thu hệ thống</small>
          <h4 className="text-success mb-0 fw-bold">{formatCurrency(calculateTotalRevenue())}</h4>
        </div>
      </div>

      <div className="dashboard-section bg-white p-4 rounded shadow-sm">
        <div className="section-header mb-3">
          <h5 className="fw-bold">
            <i className="bi bi-calendar3 me-2 text-primary"></i>
            Doanh thu theo từng tháng
          </h5>
        </div>
        
        <Table hover responsive className="data-table mb-0">
          <thead>
            <tr>
              <th>Tháng / Năm</th>
              <th className="text-center">Số lượng đơn hàng</th>
              <th className="text-end">Tổng doanh thu</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.length > 0 ? (
              monthlyData.map((item, index) => (
                <tr key={index}>
                  <td className="fw-bold">
                    Tháng {item._id.month} / {item._id.year}
                  </td>
                  <td className="text-center">
                    <span className="badge bg-light text-dark border px-3 py-2">
                       {item.orderCount} đơn hàng
                    </span>
                  </td>
                  <td className="text-end fw-bold text-success">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                  <td className="text-center">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleViewDetails(item._id.year, item._id.month)}
                      className="rounded-pill px-3"
                    >
                      <i className="bi bi-eye me-1"></i> Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-5 text-muted">
                    Chưa có dữ liệu doanh thu.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal chi tiết đơn hàng theo tháng */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 fw-bold">
            Chi tiết doanh thu Tháng {selectedMonth?.month} / {selectedMonth?.year}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {loadingDetails ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0 border-0">
              <thead className="bg-light">
                <tr className="border-top-0">
                  <th className="ps-4 border-0">Mã đơn</th>
                  <th className="border-0">Khách hàng</th>
                  <th className="border-0">Ngày đặt</th>
                  <th className="text-end pe-4 border-0">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {details.length > 0 ? (
                  details.map((order) => (
                    <tr key={order._id}>
                      <td className="ps-4 text-primary fw-bold">#{order._id.toString().slice(-6).toUpperCase()}</td>
                      <td>
                        <div className="fw-500">{order.customer?.fullName}</div>
                        <small className="text-muted">{order.customer?.email}</small>
                      </td>
                      <td>{format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</td>
                      <td className="text-end pe-4 fw-bold">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">Không có đơn hàng nào trong tháng này.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RevenueManagementPage;
