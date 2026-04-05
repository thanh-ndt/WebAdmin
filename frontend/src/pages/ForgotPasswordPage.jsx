import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api/authApi';
import '../styles/Auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      const res = await forgotPasswordApi({ email });
      setMessage(res.data.message);
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
            <div className="icon-wrapper icon-warning">
              <i className="bi bi-key-fill fs-4"></i>
            </div>
            <h2 className="auth-title">Quên Mật Khẩu</h2>
            <p className="auth-subtitle">Nhập email để nhận link đặt lại mật khẩu</p>
          </div>

          {error && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
          {message && <div className="alert alert-success py-2 small"><i className="bi bi-envelope-check me-2"></i>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold small">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                <input type="email" className="form-control border-start-0 ps-0" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-warning w-100 fw-semibold py-2 text-white" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</> : 'Gửi Link Đặt Lại'}
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

export default ForgotPasswordPage;
