import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginApi } from '../api/authApi';
import { loginSuccess } from '../redux/authSlice';
import '../styles/Auth.css';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const { user, token } = useSelector((state) => state.auth);
    if (token && user && user.role === 'owner') {
        return <Navigate to="/admin" replace />;
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginApi(form);
            dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
                            <i className="bi bi-bicycle fs-4"></i>
                        </div>
                        <h2 className="auth-title">Đăng Nhập</h2>
                        <p className="auth-subtitle">Web Bán Xe Máy</p>
                    </div>

                    {error && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Email</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                                <input type="email" name="email" className="form-control border-start-0 ps-0" placeholder="example@gmail.com" value={form.email} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-semibold small">Mật khẩu</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock text-muted"></i></span>
                                <input type={showPassword ? "text" : "password"} name="password" className="form-control border-start-0 border-end-0 ps-0" placeholder="Nhập mật khẩu" value={form.password} onChange={handleChange} required />
                                <button type="button" className="btn btn-outline-secondary border-start-0 bg-white" style={{ borderColor: '#dee2e6' }} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''} text-muted`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="text-end mb-4">
                            <Link to="/forgot-password" className="text-danger small text-decoration-none">Quên mật khẩu?</Link>
                        </div>
                        <button type="submit" className="btn btn-danger w-100 fw-semibold py-2" disabled={loading}>
                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang đăng nhập...</> : 'Đăng Nhập'}
                        </button>
                    </form>

                    
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
