import React, { useState, useEffect } from 'react';
import {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getVehicleModels
} from '../api/adminApi';

const PromotionManagementPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [vehicleModels, setVehicleModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        code: '',
        discountValue: '',
        type: 'percentage',
        description: '',
        validFrom: '',
        validTo: '',
        applicableModels: [],
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('Bắt đầu tải dữ liệu...');
            const [promoRes, modelRes] = await Promise.all([
                getPromotions(),
                getVehicleModels()
            ]);

            console.log('Raw Promo Data:', promoRes.data);
            console.log('Raw Model Data:', modelRes.data);

            const promoList = promoRes.data?.data || [];
            const modelList = modelRes.data?.data || [];

            setPromotions(promoList);
            setVehicleModels(modelList);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            showToast('Không thể tải danh sách khuyến mãi', 'error');
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
            code: '',
            discountValue: '',
            type: 'percentage',
            description: '',
            validFrom: '',
            validTo: '',
            applicableModels: [],
            isActive: true
        });
        setEditing(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (promo) => {
        setEditing(promo._id);
        setForm({
            code: promo.code,
            discountValue: promo.discountValue,
            type: promo.type,
            description: promo.description || '',
            validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split('T')[0] : '',
            validTo: promo.validTo ? new Date(promo.validTo).toISOString().split('T')[0] : '',
            applicableModels: promo.applicableModels?.map(m => typeof m === 'object' ? m._id : m) || [],
            isActive: promo.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updatePromotion(editing, form);
                showToast('Cập nhật khuyến mãi thành công');
            } else {
                await createPromotion(form);
                showToast('Tạo khuyến mãi mới thành công');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
        try {
            await deletePromotion(id);
            showToast('Đã xóa khuyến mãi');
            fetchData();
        } catch (error) {
            showToast('Lỗi khi xóa khuyến mãi', 'error');
        }
    };

    const handleModelChange = (modelId) => {
        setForm(prev => ({
            ...prev,
            applicableModels: modelId ? [modelId] : []
        }));
    };

    const getStatusBadge = (promo) => {
        const now = new Date();
        const start = new Date(promo.validFrom);
        const end = new Date(promo.validTo);

        if (!promo.isActive) return <span className="badge-status badge-cancelled">Tạm ngưng</span>;
        if (now < start) return <span className="badge-status badge-confirmed">Sắp diễn ra</span>;
        if (now > end) return <span className="badge-status badge-discontinued">Hết hạn</span>;
        return <span className="badge-status badge-completed">Đang chạy</span>;
    };

    const handleModelToggle = (modelId) => {
        setForm(prev => {
            const current = [...prev.applicableModels];
            if (current.includes(modelId)) {
                return { ...prev, applicableModels: current.filter(id => id !== modelId) };
            } else {
                return { ...prev, applicableModels: [...current, modelId] };
            }
        });
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <h2>Quản lý khuyến mãi</h2>
                <button className="btn-add" onClick={openAddModal}>
                    <i className="bi bi-plus-lg"></i> Tạo khuyến mãi mới
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="data-table-wrapper mt-4">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Giá trị</th>
                                <th>Thời gian</th>
                                <th>Dòng xe áp dụng</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">Chưa có mã khuyến mãi nào</td>
                                </tr>
                            ) : (
                                promotions.map(promo => (
                                    <tr key={promo._id}>
                                        <td className="fw-bold text-primary">{promo.code}</td>
                                        <td>
                                            {promo.type === 'percentage'
                                                ? `${promo.discountValue}%`
                                                : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.discountValue)
                                            }
                                        </td>
                                        <td className="small">
                                            <div>Bắt đầu: {new Date(promo.validFrom).toLocaleDateString('vi-VN')}</div>
                                            <div>Kết thúc: {new Date(promo.validTo).toLocaleDateString('vi-VN')}</div>
                                        </td>
                                        <td>
                                            {promo.applicableModels?.length > 0
                                                ? <div className="d-flex flex-wrap gap-1">
                                                    {promo.applicableModels.map((m, idx) => (
                                                        <span key={idx} className="badge bg-light text-dark border small">
                                                            {typeof m === 'object' ? m.name : 'Model'}
                                                        </span>
                                                    ))}
                                                </div>
                                                : <span className="text-muted small">Tất cả xe</span>
                                            }
                                        </td>
                                        <td>{getStatusBadge(promo)}</td>
                                        <td>
                                            <button className="action-btn edit" onClick={() => openEditModal(promo)}>
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(promo._id)}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>{editing ? '✏️ Chỉnh sửa khuyến mãi' : '📣 Tạo khuyến mãi mới'}</h3>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="fw-bold mb-1">Mã khuyến mãi *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        required
                                        placeholder="VD: GIAM20, TET2024..."
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label className="fw-bold mb-1">Loại giảm giá *</label>
                                        <select
                                            className="form-control"
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="percentage">Phần trăm (%)</option>
                                            <option value="fixed">Số tiền cố định (VNĐ)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label className="fw-bold mb-1">Giá trị giảm *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.discountValue}
                                            onChange={e => setForm({ ...form, discountValue: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-3">
                                    <label className="fw-bold mb-1">Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label className="fw-bold mb-1">Ngày bắt đầu *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={form.validFrom}
                                            onChange={e => setForm({ ...form, validFrom: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label className="fw-bold mb-1">Ngày kết thúc *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={form.validTo}
                                            onChange={e => setForm({ ...form, validTo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-3">
                                    <label className="fw-bold mb-1">Dòng xe áp dụng</label>
                                    <select
                                        className="form-control"
                                        value={form.applicableModels[0] || ''}
                                        onChange={e => handleModelChange(e.target.value)}
                                    >
                                        <option value="">Áp dụng cho tất cả dòng xe</option>
                                        {vehicleModels.map(model => (
                                            <option key={model._id} value={model._id}>
                                                {model.name} {model.brand?.name ? `(${model.brand.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isActive"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    />
                                    <label className="form-check-label fw-bold" htmlFor="isActive">
                                        Kích hoạt mã này
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Đang lưu...' : 'Lưu lại'}
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
};

export default PromotionManagementPage;
