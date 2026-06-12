import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || 'Đăng nhập thất bại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-banner">
        <img
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format"
          alt="Thời trang nam công sở"
        />
        <div className="auth-banner__overlay">
          <div className="auth-banner__text">
            <h2>Phong cách<br />bắt đầu từ đây</h2>
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo">
            <Link to="/">
              <span>MEN'S SHOP</span>
            </Link>
          </div>

          <h1>Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng trở lại</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>

          <div className="auth-demo">
            <p>Demo tài khoản:</p>
            <p>Admin: admin@menshop.com / Admin123456</p>
            <p>Customer: customer@menshop.com / Customer123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.'); return;
    }
    try {
      setLoading(true);
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (e) {
      setError(e.response?.data?.message || 'Đăng ký thất bại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-banner">
        <img
          src="https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=1000&auto=format"
          alt="Phong cách thời trang nam hiện đại"
        />
        <div className="auth-banner__overlay">
          <div className="auth-banner__text">
            <h2>Gia nhập<br />cộng đồng</h2>
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo">
            <Link to="/"><span>MEN'S SHOP</span></Link>
          </div>

          <h1>Đăng ký</h1>
          <p className="auth-subtitle">Tạo tài khoản mới</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="0901 234 567"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Ít nhất 8 ký tự"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
