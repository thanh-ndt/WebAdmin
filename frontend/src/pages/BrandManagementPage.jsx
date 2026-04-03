import { useState, useEffect } from 'react';
import { getBrands, createBrand, updateBrand, deleteBrand, getBrandStats } from '../api/adminApi';
import StatsHeader from '../components/StatsHeader';

function BrandManagementPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', country: '', description: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ name: '', country: '', description: '' });
    setEditing(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setEditing(brand._id);
    setForm({
      name: brand.name || '',
      country: brand.country || '',
      description: brand.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateBrand(editing, form);
        showToast('Cập nhật thương hiệu thành công!');
      } else {
        await createBrand(form);
        showToast('Thêm thương hiệu thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;
    try {
      await deleteBrand(id);
      showToast('Xóa thương hiệu thành công!');
      fetchBrands();
    } catch (error) {
      showToast('Lỗi xóa thương hiệu!', 'error');
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Quản lý thương hiệu</h2>
        <button className="btn-add" onClick={openAddModal}>
          <i className="bi bi-plus-lg"></i> Thêm thương hiệu
        </button>
      </div>

      <StatsHeader
        fetchFn={getBrandStats}
        cards={[
          { key: 'total', label: 'Tổng thương hiệu', icon: 'bi-tags-fill', color: '#3498db' }
        ]}
      />

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : brands.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-tags"></i>
          <p>Chưa có thương hiệu nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên thương hiệu</th>
                <th>Quốc gia</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, index) => (
                <tr key={brand._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{brand.name}</td>
                  <td>{brand.country || '-'}</td>
                  <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {brand.description || '-'}
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(brand)} title="Sửa">
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(brand._id)} title="Xóa">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>{editing ? '✏️ Sửa thương hiệu' : '➕ Thêm thương hiệu'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên thương hiệu *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="VD: Honda, Yamaha, Suzuki..."
                  />
                </div>
                <div className="form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="VD: Nhật Bản"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả về thương hiệu..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : editing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
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

export default BrandManagementPage;
