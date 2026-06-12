import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
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

          {location.state?.reset && <div className="alert alert-success">Đặt lại mật khẩu thành công! Vui lòng đăng nhập.</div>}
          {location.state?.registered && <div className="alert alert-success">Đăng ký thành công! Vui lòng đăng nhập.</div>}
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

          <p className="auth-forgot">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
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

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-banner">
        <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format" alt="Thời trang nam" />
        <div className="auth-banner__overlay">
          <div className="auth-banner__text"><h2>Khôi phục<br />tài khoản</h2></div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo"><Link to="/"><span>MEN'S SHOP</span></Link></div>
          <h1>Quên mật khẩu</h1>
          <p className="auth-subtitle">Nhập email để nhận liên kết đặt lại mật khẩu</p>

          {sent ? (
            <>
              <div className="alert alert-success">
                Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
              </div>
              <p className="auth-switch"><Link to="/login">← Về đăng nhập</Link></p>
            </>
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Gửi liên kết đặt lại'}
                </button>
              </form>
              <p className="auth-switch"><Link to="/login">← Về đăng nhập</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return; }
    if (form.password !== form.confirm) { setError('Xác nhận mật khẩu không khớp.'); return; }
    try {
      setLoading(true);
      await authService.resetPassword(token, form.password);
      navigate('/login', { state: { reset: true } });
    } catch (e) {
      setError(e.response?.data?.message || 'Liên kết không hợp lệ hoặc đã hết hạn.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-banner">
        <img src="https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=1000&auto=format" alt="Thời trang nam" />
        <div className="auth-banner__overlay">
          <div className="auth-banner__text"><h2>Đặt lại<br />mật khẩu</h2></div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo"><Link to="/"><span>MEN'S SHOP</span></Link></div>
          <h1>Đặt lại mật khẩu</h1>
          <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>

          {!token ? (
            <div className="alert alert-error">Liên kết không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.</div>
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Ít nhất 8 ký tự"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}
          <p className="auth-switch"><Link to="/login">← Về đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}
