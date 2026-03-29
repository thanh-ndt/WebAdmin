import { useState, useEffect } from 'react';
import {
  getVehicles, createVehicle, updateVehicle, deleteVehicle,
  getBrands, getVehicleModels, getVehicleStats
} from '../api/adminApi';
import StatsHeader from '../components/StatsHeader';

const CATEGORIES = ['Xe ga', 'Xe số', 'Xe thể thao', 'Phân khối lớn', 'Xe điện', 'Phân khối nhỏ cổ điển'];

const SPEC_FIELDS = [
  { key: 'dong_co', label: 'Động cơ', placeholder: 'VD: 4 kỳ, xi lanh đơn, làm mát bằng không khí' },
  { key: 'cong_suat', label: 'Công suất', placeholder: 'VD: 6.4kW (8.7PS) / 8000 vòng/phút' },
  { key: 'tieu_hao', label: 'Tiêu hao nhiên liệu', placeholder: 'VD: 1.68 lít / 100km' },
  { key: 'chieu_cao_yen', label: 'Chiều cao yên', placeholder: 'VD: 769 mm' },
  { key: 'binh_xang', label: 'Dung tích bình xăng', placeholder: 'VD: 4.1 lít' },
  { key: 'phan_h', label: 'Hệ thống phanh', placeholder: 'VD: Phanh đĩa / Phanh tang trống' },
  { key: 'cong_nghe', label: 'Công nghệ', placeholder: 'VD: Phun xăng điện tử PGM-FI, CBS' },
];
const STATUSES = ['available', 'out_of_stock', 'discontinued'];
const STATUS_LABELS = { available: 'Còn hàng', out_of_stock: 'Hết hàng', discontinued: 'Ngừng kinh doanh' };

const COMMON_MODELS = [
  'Sirius', 'Wave Alpha', 'Wave RSX', 'Vision', 'Air Blade', 'Exciter', 'Winner X',
  'SH 125i/150i', 'SH Mode', 'Lead', 'Grande', 'Janus', 'NVX', 'Jupiter', 'Future'
];

function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '', brand: '', vehicleModel: '', category: 'Xe ga',
    engineCapacity: '', manufacture: '', description: '',
    price: '', status: 'available', stockQuantity: '', isPublished: true,
  });
  const [specs, setSpecs] = useState({
    dong_co: '', cong_suat: '', tieu_hao: '', chieu_cao_yen: '',
    binh_xang: '', phan_h: '', cong_nghe: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [page, search, filterBrand, filterStatus]);

  const fetchDropdowns = async () => {
    try {
      const [brandsRes, modelsRes] = await Promise.all([getBrands(), getVehicleModels()]);
      setBrands(brandsRes.data);
      setVehicleModels(modelsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await getVehicles({
        page, limit: 10, search, brand: filterBrand, status: filterStatus
      });
      setVehicles(data.vehicles);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({
      name: '', brand: '', vehicleModel: '', category: 'Xe ga',
      engineCapacity: '', manufacture: '', description: '',
      price: '', status: 'available', stockQuantity: '', isPublished: true,
    });
    setSpecs({
      dong_co: '', cong_suat: '', tieu_hao: '', chieu_cao_yen: '',
      binh_xang: '', phan_h: '', cong_nghe: '',
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setExistingImages([]);
    setRemovedImages([]);
    setEditing(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditing(vehicle._id);
    setForm({
      name: vehicle.name || '',
      brand: vehicle.brand?._id || '',
      vehicleModel: vehicle.vehicleModel?._id || '',
      category: vehicle.category || 'Xe ga',
      engineCapacity: vehicle.engineCapacity || '',
      manufacture: vehicle.manufacture || '',
      description: vehicle.description || '',
      price: vehicle.price || '',
      status: vehicle.status || 'available',
      stockQuantity: vehicle.stockQuantity || '',
      isPublished: vehicle.isPublished !== undefined ? vehicle.isPublished : true,
    });
    const existingSpecs = vehicle.specifications || {};
    setSpecs({
      dong_co: existingSpecs.dong_co || '',
      cong_suat: existingSpecs.cong_suat || '',
      tieu_hao: existingSpecs.tieu_hao || '',
      chieu_cao_yen: existingSpecs.chieu_cao_yen || '',
      binh_xang: existingSpecs.binh_xang || '',
      phan_h: existingSpecs.phan_h || '',
      cong_nghe: existingSpecs.cong_nghe || '',
    });
    setExistingImages(vehicle.images || []);
    setRemovedImages([]);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length - removedImages.length + selectedFiles.length + files.length;

    if (totalImages > 10) {
      showToast(`Tối đa 10 ảnh! Bạn còn có thể thêm ${10 - (existingImages.length - removedImages.length + selectedFiles.length)} ảnh.`, 'error');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setRemovedImages(prev => [...prev, imageUrl]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== '') formData.append(key, form[key]);
      });

      // Build specifications object from non-empty fields
      const specsObj = {};
      Object.entries(specs).forEach(([key, val]) => {
        if (val && val.trim() !== '') specsObj[key] = val.trim();
      });
      if (Object.keys(specsObj).length > 0) {
        formData.append('specifications', JSON.stringify(specsObj));
      }

      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      if (editing && removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(removedImages));
      }

      if (editing) {
        await updateVehicle(editing, formData);
        showToast('Cập nhật xe thành công!');
      } else {
        await createVehicle(formData);
        showToast('Thêm xe mới thành công!');
      }

      setShowModal(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (vehicle) => {
    const originalStatus = vehicle.isPublished;
    const newStatus = !originalStatus;

    // Optimistic update
    setVehicles(prev => prev.map(v => v._id === vehicle._id ? { ...v, isPublished: newStatus } : v));

    try {
      const formData = new FormData();
      formData.append('isPublished', newStatus);

      await updateVehicle(vehicle._id, formData);
      showToast(newStatus ? 'Đã hiển thị xe trên trang sản phẩm' : 'Đã ẩn xe khỏi trang sản phẩm');
    } catch (error) {
      // Revert on error
      setVehicles(prev => prev.map(v => v._id === vehicle._id ? { ...v, isPublished: originalStatus } : v));
      showToast('Lỗi khi cập nhật trạng thái hiển thị!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này?')) return;
    try {
      await deleteVehicle(id);
      showToast('Xóa xe thành công!');
      fetchVehicles();
    } catch (error) {
      showToast('Lỗi xóa xe!', 'error');
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>🚗 Quản lý xe</h2>
        <button className="btn-add" onClick={openAddModal}>
          <i className="bi bi-plus-lg"></i> Thêm xe mới
        </button>
      </div>

      <StatsHeader
        fetchFn={getVehicleStats}
        cards={[
          { key: 'total', label: 'Tổng số xe', icon: 'bi-truck', color: '#3498db' },
          { key: 'available', label: 'Còn hàng', icon: 'bi-check-circle', color: '#27ae60' },
          { key: 'outOfStock', label: 'Hết hàng', icon: 'bi-dash-circle', color: '#f39c12' },
          { key: 'discontinued', label: 'Ngừng bán', icon: 'bi-x-circle', color: '#e74c3c' },
          { key: 'hidden', label: 'Đang ẩn', icon: 'bi-eye-slash-fill', color: '#636e72' },
        ]}
      />

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm xe..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}>
          <option value="">Tất cả thương hiệu</option>
          {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : vehicles.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-truck"></i>
          <p>Chưa có xe nào</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên xe</th>
                <th>Thương hiệu</th>
                <th>Dòng xe</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hiển thị</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id}>
                  <td>
                    {vehicle.images?.[0] ? (
                      <img src={vehicle.images[0]} alt={vehicle.name} className="vehicle-thumb" />
                    ) : (
                      <div className="vehicle-thumb" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                        <i className="bi bi-image" style={{ color: '#94a3b8' }}></i>
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{vehicle.name}</td>
                  <td>{vehicle.brand?.name || 'N/A'}</td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {vehicle.vehicleModel?.name || 'N/A'}
                    </span>
                  </td>
                  <td>{vehicle.category}</td>
                  <td>{formatCurrency(vehicle.price)}</td>
                  <td>{vehicle.stockQuantity}</td>
                  <td>
                    <span className={`badge-status badge-${vehicle.status}`}>
                      {STATUS_LABELS[vehicle.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleVisibility(vehicle)}
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: vehicle.isPublished ? '#27ae60' : '#b2bec3',
                        fontSize: '1.2rem'
                      }}
                      title={vehicle.isPublished ? 'Đang hiển thị - Nhấn để ẩn' : 'Đang ẩn - Nhấn để hiển thị'}
                    >
                      <i className={`bi ${vehicle.isPublished ? 'bi-eye-fill' : 'bi-eye-slash'}`}></i>
                    </button>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(vehicle)} title="Sửa">
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(vehicle._id)} title="Xóa">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <span className="pagination-info">
              Hiển thị {vehicles.length} / {total} xe
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? '✏️ Sửa thông tin xe' : '➕ Thêm xe mới'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên xe *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Nhập tên xe..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Thương hiệu *</label>
                    <select
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      required
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Dòng xe *</label>
                    <select
                      value={form.vehicleModel}
                      onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                      required
                    >
                      <option value="">Chọn dòng xe</option>
                      {vehicleModels
                        .filter(m => !form.brand || (m.brand?._id || m.brand) === form.brand)
                        .map(m => <option key={m._id} value={m._id}>{m.name}</option>)
                      }
                    </select>
                    {form.brand && vehicleModels.filter(m => (m.brand?._id || m.brand) === form.brand).length === 0 && (
                      <p style={{ fontSize: 11, color: '#e67e22', marginTop: 4 }}>
                        Lưu ý: Chưa có dòng xe nào cho hãng này.
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục (nhập mới)</label>
                    <input
                      list="categories-list"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Chọn hoặc nhập danh mục mới..."
                    />
                    <datalist id="categories-list">
                      {/* Combine unique categories from existing vehicles with default categories */}
                      {Array.from(new Set([...CATEGORIES, ...vehicles.map(v => v.category)]))
                        .filter(Boolean)
                        .map(c => <option key={c} value={c} />)
                      }
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Phân khối (cc)</label>
                    <input
                      type="number"
                      value={form.engineCapacity}
                      onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })}
                      placeholder="VD: 150"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giá (VNĐ) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      placeholder="VD: 55000000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số lượng tồn kho</label>
                    <input
                      type="number"
                      value={form.stockQuantity}
                      onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                      placeholder="VD: 20"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Năm sản xuất</label>
                    <input
                      type="number"
                      value={form.manufacture}
                      onChange={(e) => setForm({ ...form, manufacture: e.target.value })}
                      placeholder="VD: 2024"
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả xe..."
                    rows={3}
                  />
                </div>

                {/* Thông số kỹ thuật */}
                <div className="form-group" style={{ marginTop: 16, marginBottom: 16 }}>
                  <label style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, display: 'block' }}>
                    📋 Thông số kỹ thuật
                  </label>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 16px 8px', border: '1px solid #e2e8f0' }}>
                    {SPEC_FIELDS.map(spec => (
                      <div key={spec.key} className="form-group" style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{spec.label}</label>
                        <input
                          type="text"
                          value={specs[spec.key] || ''}
                          onChange={(e) => setSpecs(prev => ({ ...prev, [spec.key]: e.target.value }))}
                          placeholder={spec.placeholder}
                          style={{ fontSize: 14 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                    <input
                      type="checkbox"
                      id="isPublished"
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    />
                    <label htmlFor="isPublished" style={{ marginBottom: 0, fontWeight: 600, cursor: 'pointer' }}>
                      Hiển thị trên trang sản phẩm
                    </label>
                  </div>
                  <p style={{ fontSize: 12, color: '#888', marginLeft: 28 }}>
                    Nếu tắt, xe sẽ không xuất hiện trên danh sách sản phẩm và tìm kiếm của khách hàng.
                  </p>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label>Hình ảnh (tối đa 10 ảnh)</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                    />
                    <div className="upload-icon">
                      <i className="bi bi-cloud-arrow-up"></i>
                    </div>
                    <div className="upload-text">
                      <strong>Kéo thả</strong> hoặc nhấn để chọn ảnh
                    </div>
                    <div className="upload-hint">
                      JPG, PNG, WebP - Tối đa 10MB/ảnh - Tối đa 10 ảnh
                    </div>
                  </div>

                  {/* Existing Images */}
                  {existingImages.filter(img => !removedImages.includes(img)).length > 0 && (
                    <div className="image-preview-grid">
                      {existingImages
                        .filter(img => !removedImages.includes(img))
                        .map((img, index) => (
                          <div key={`existing-${index}`} className="image-preview-item">
                            <img src={img} alt={`Existing ${index}`} />
                            <button
                              type="button"
                              className="image-remove-btn"
                              onClick={() => removeExistingImage(img)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* New Image Previews */}
                  {previewUrls.length > 0 && (
                    <div className="image-preview-grid" style={{ marginTop: existingImages.length ? 8 : 16 }}>
                      {previewUrls.map((url, index) => (
                        <div key={`new-${index}`} className="image-preview-item">
                          <img src={url} alt={`Preview ${index}`} />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => removeNewImage(index)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : editing ? 'Cập nhật' : 'Thêm xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default VehicleManagementPage;
