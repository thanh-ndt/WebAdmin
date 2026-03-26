import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordApi } from '../api/authApi';
import '../styles/Auth.css';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.password !== form.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp.');
        }
        setLoading(true);
        try {
            const res = await resetPasswordApi(token, { password: form.password });
            setSuccess(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card login-card">
                <div className="auth-card-body">
                    <div className="auth-header">
                        <div className="icon-wrapper icon-danger">
                            <i className="bi bi-shield-lock-fill fs-4"></i>
                        </div>
                        <h2 className="auth-title">Đặt Lại Mật Khẩu</h2>
                        <p className="auth-subtitle">Nhập mật khẩu mới của bạn</p>
                    </div>

                    {error && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
                    {success && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-2"></i>{success} Đang chuyển hướng...</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Mật khẩu mới</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock text-muted"></i></span>
                                <input type={showPassword ? "text" : "password"} name="password" className="form-control border-start-0 border-end-0 ps-0" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={handleChange} required />
                                <button type="button" className="btn btn-outline-secondary border-start-0 bg-white" style={{ borderColor: '#dee2e6' }} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''} text-muted`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold small">Xác nhận mật khẩu mới</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-control border-start-0 border-end-0 ps-0" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange} required />
                                <button type="button" className="btn btn-outline-secondary border-start-0 bg-white" style={{ borderColor: '#dee2e6' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''} text-muted`}></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-danger w-100 fw-semibold py-2" disabled={loading || !!success}>
                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</> : 'Đặt Lại Mật Khẩu'}
                        </button>
                    </form>

                    <p className="text-center small mt-3 mb-0">
                        <Link to="/login" className="text-danger text-decoration-none"><i className="bi bi-arrow-left me-1"></i>Quay lại đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
