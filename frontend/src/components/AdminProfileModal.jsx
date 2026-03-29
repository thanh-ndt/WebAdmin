import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../redux/authSlice';
import { updateProfileApi, changePasswordApi } from '../api/authApi';

const AdminProfileModal = ({ isOpen, onClose }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Personal Info State
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
    });

    // Password State
    const [passData, setPassData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    if (!isOpen) return null;

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await updateProfileApi(profileData);
            dispatch(updateUser(res.data.user));
            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Lỗi khi cập nhật thông tin.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return setMessage({ type: 'danger', text: 'Mật khẩu mới không khớp.' });
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await changePasswordApi({
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword,
            });
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Lỗi khi đổi mật khẩu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Thông tin tài khoản</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Tabs */}
                    <div className="d-flex mb-4 border-bottom">
                        <button
                            className={`btn pb-2 px-3 rounded-0 ${activeTab === 'info' ? 'border-bottom border-primary border-3 text-primary fw-bold' : 'text-secondary'}`}
                            style={{ background: 'none' }}
                            onClick={() => { setActiveTab('info'); setMessage({ type: '', text: '' }); }}
                        >
                            Thông tin cá nhân
                        </button>
                        <button
                            className={`btn pb-2 px-3 rounded-0 ${activeTab === 'password' ? 'border-bottom border-primary border-3 text-primary fw-bold' : 'text-secondary'}`}
                            style={{ background: 'none' }}
                            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
                        >
                            Đôi mật khẩu
                        </button>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type} py-2 small`} role="alert">
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'info' ? (
                        <form onSubmit={handleProfileSubmit}>
                            <div className="form-group mb-3 text-start">
                                <label className="form-label small fw-bold">Email (Không thể thay đổi)</label>
                                <input type="text" className="form-control bg-light" value={user?.email} disabled />
                            </div>
                            <div className="form-group mb-3 text-start">
                                <label className="form-label small fw-bold">Họ và tên</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group mb-4 text-start">
                                <label className="form-label small fw-bold">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.phoneNumber}
                                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group mb-3 text-start">
                                <label className="form-label small fw-bold">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={passData.oldPassword}
                                    onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3 text-start">
                                <label className="form-label small fw-bold">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group mb-4 text-start">
                                <label className="form-label small fw-bold">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={passData.confirmPassword}
                                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-bold" disabled={loading}>
                                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfileModal;
