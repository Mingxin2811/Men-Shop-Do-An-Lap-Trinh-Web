import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import loginImage from '../assets/login-old-money-banner.png';
import registerImage from '../assets/register-old-money-banner.png';
import './AuthPages.css';

const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

function AuthBanner({ image, alt, children }) {
  return (
    <div className="auth-banner">
      <img src={image} alt={alt} />
      <div className="auth-banner__overlay">
        <div className="auth-banner__text"><h2>{children}</h2></div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBanner image={loginImage} alt="Thời trang nam công sở">
        Phong cách<br />bắt đầu từ đây
      </AuthBanner>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo"><Link to="/"><span>MEN&apos;S SHOP</span></Link></div>
          <h1>Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng trở lại</p>

          {location.state?.reset && <div className="alert alert-success">Đặt lại mật khẩu thành công. Vui lòng đăng nhập.</div>}
          {location.state?.registered && <div className="alert alert-success">Đăng ký thành công. Vui lòng đăng nhập.</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
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
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Đăng nhập'}
            </button>
          </form>
          <p className="auth-forgot"><Link to="/forgot-password">Quên mật khẩu?</Link></p>

          <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const validatePassword = () => {
    if (!isStrongPassword(form.password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ cái, chữ số và ký tự đặc biệt.');
      return false;
    }
    return true;
  };

  const requestOtp = async () => {
    setError('');
    setNotice('');
    if (!form.name.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!validatePassword()) return;

    try {
      setLoading(true);
      const response = await authService.requestRegistrationOtp({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      setOtpSent(true);
      const devOtp = response.data.data?.devOtp;
      setNotice(
        devOtp
          ? `${response.data.message} Mã OTP: ${devOtp}`
          : response.data.message || 'Mã OTP đã được gửi đến email.'
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!otpSent) {
      await requestOtp();
      return;
    }
    if (!/^\d{6}$/.test(form.otp)) {
      setError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }
    if (!validatePassword()) return;

    try {
      setLoading(true);
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBanner image={registerImage} alt="Phong cách thời trang nam hiện đại">
        Gia nhập<br />cộng đồng
      </AuthBanner>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo"><Link to="/"><span>MEN&apos;S SHOP</span></Link></div>
          <h1>Đăng ký</h1>
          <p className="auth-subtitle">
            {otpSent ? `Nhập mã OTP đã gửi đến ${form.email}` : 'Tạo tài khoản mới'}
          </p>

          {notice && <div className="alert alert-success">{notice}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                disabled={otpSent}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                disabled={otpSent}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Có thể dùng mọi mã vùng quốc gia"
                disabled={otpSent}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                disabled={otpSent}
                required
              />
              <p className="auth-field-hint">Ít nhất 8 ký tự, có chữ cái, chữ số và ký tự đặc biệt.</p>
            </div>
            {otpSent && (
              <div className="form-group">
                <label className="form-label">Mã OTP *</label>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input auth-otp-input"
                  value={form.otp}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    otp: event.target.value.replace(/\D/g, ''),
                  }))}
                  placeholder="000000"
                  autoFocus
                  required
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : otpSent ? 'Xác nhận và đăng ký' : 'Gửi mã OTP'}
            </button>
            {otpSent && (
              <div className="auth-secondary-actions">
                <button type="button" onClick={requestOtp} disabled={loading}>Gửi lại OTP</button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setForm((current) => ({ ...current, otp: '' }));
                    setNotice('');
                    setError('');
                  }}
                >
                  Sửa thông tin
                </button>
              </div>
            )}
          </form>
          <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const requestOtp = async (event) => {
    event?.preventDefault();
    setError('');
    setNotice('');
    try {
      setLoading(true);
      const response = await authService.forgotPassword(form.email.trim());
      setOtpSent(true);
      const devOtp = response.data.data?.devOtp;
      setNotice(
        devOtp
          ? `${response.data.message} Mã OTP: ${devOtp}`
          : response.data.message || 'Mã OTP đã được gửi đến email.'
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(form.otp)) {
      setError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }
    if (!isStrongPassword(form.password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ cái, chữ số và ký tự đặc biệt.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(form.email, form.otp, form.password);
      navigate('/login', { state: { reset: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBanner image={loginImage} alt="Thời trang nam">
        Khôi phục<br />tài khoản
      </AuthBanner>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-logo"><Link to="/"><span>MEN&apos;S SHOP</span></Link></div>
          <h1>Quên mật khẩu</h1>
          <p className="auth-subtitle">
            {otpSent ? 'Nhập OTP và mật khẩu mới' : 'Nhập email đã đăng ký để nhận mã OTP'}
          </p>
          {notice && <div className="alert alert-success">{notice}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={otpSent ? resetPassword : requestOtp}>
            <div className="form-group">
              <label className="form-label">Email đăng ký</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                disabled={otpSent}
                required
              />
            </div>
            {otpSent && (
              <>
                <div className="form-group">
                  <label className="form-label">Mã OTP</label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    className="form-input auth-otp-input"
                    value={form.otp}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      otp: event.target.value.replace(/\D/g, ''),
                    }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                  <p className="auth-field-hint">Ít nhất 8 ký tự, có chữ cái, chữ số và ký tự đặc biệt.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Nhập lại mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.confirm}
                    onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))}
                    required
                  />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : otpSent ? 'Đổi mật khẩu' : 'Gửi mã OTP'}
            </button>
            {otpSent && (
              <div className="auth-secondary-actions">
                <button type="button" onClick={requestOtp} disabled={loading}>Gửi lại OTP</button>
                <button type="button" onClick={() => setOtpSent(false)}>Đổi email</button>
              </div>
            )}
          </form>
          <p className="auth-switch"><Link to="/login">← Về đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <AuthBanner image={registerImage} alt="Thời trang nam">
        Bảo mật<br />tài khoản
      </AuthBanner>
      <div className="auth-form-wrap">
        <div className="auth-form text-center">
          <div className="auth-logo"><Link to="/"><span>MEN&apos;S SHOP</span></Link></div>
          <h1>Đặt lại mật khẩu</h1>
          <p className="auth-subtitle">Hệ thống hiện sử dụng mã OTP gửi trực tiếp đến email.</p>
          <Link to="/forgot-password" className="btn btn-primary btn-lg w-full">Nhận mã OTP</Link>
        </div>
      </div>
    </div>
  );
}
