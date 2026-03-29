import { useState, useEffect } from 'react';
import { 
  getVehicleModels, 
  createVehicleModel, 
  updateVehicleModel, 
  deleteVehicleModel, 
  getVehicleModelStats,
  getBrands
} from '../api/adminApi';
import StatsHeader from '../components/StatsHeader';

function VehicleModelManagementPage() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    brand: '',
    description: '' 
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [modelsRes, brandsRes] = await Promise.all([
        getVehicleModels(),
        getBrands()
      ]);
      setModels(modelsRes.data.data || []);
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      showToast('Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const { data } = await getVehicleModels();
      setModels(data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách dòng xe:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ 
      name: '', 
      brand: '',
      description: '' 
    });
    setEditing(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (model) => {
    setEditing(model._id);
    setForm({
      name: model.name || '',
      brand: model.brand?._id || model.brand || '',
      description: model.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand) {
      showToast('Vui lòng chọn hãng xe', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateVehicleModel(editing, form);
        showToast('Cập nhật dòng xe thành công!');
      } else {
        await createVehicleModel(form);
        showToast('Thêm dòng xe thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchModels();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa dòng xe này?')) return;
    try {
      await deleteVehicleModel(id);
      showToast('Xóa dòng xe thành công!');
      fetchModels();
    } catch (error) {
      showToast('Lỗi khi xóa dòng xe!', 'error');
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>🏍️ Quản lý dòng xe</h2>
        <button className="btn-add" onClick={openAddModal}>
          <i className="bi bi-plus-lg"></i> Thêm dòng xe
        </button>
      </div>
      
      <StatsHeader 
        fetchFn={getVehicleModelStats} 
        cards={[
          { key: 'total', label: 'Tổng số dòng xe', icon: 'bi-grid-fill', color: '#e67e22' }
        ]} 
      />

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : models.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-grid"></i>
          <p>Chưa có dòng xe nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên dòng xe</th>
                <th>Hãng xe</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <tr key={model._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{model.name}</td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {model.brand?.name || 'Chưa xác định'}
                    </span>
                  </td>
                  <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {model.description || '-'}
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(model)} title="Sửa">
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(model._id)} title="Xóa">
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
              <h3>{editing ? '✏️ Sửa dòng xe' : '➕ Thêm dòng xe'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên dòng xe *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="VD: SH 150i, Exciter 155..."
                  />
                </div>
                <div className="form-group">
                  <label>Hãng xe *</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="">-- Chọn hãng xe --</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả về dòng xe..."
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

export default VehicleModelManagementPage;

