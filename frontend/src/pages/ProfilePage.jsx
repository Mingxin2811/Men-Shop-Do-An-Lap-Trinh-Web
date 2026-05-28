import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      setLoading(true);
      const res = await authService.updateProfile(form);
      updateUser(res.data.data.user);
      setSuccess('Cập nhật thành công!');
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally { setLoading(false); }
  };

  return (
    <div className="profile-page container">
      <div className="page-header">
        <h1>Tài khoản</h1>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="profile-avatar__circle">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="profile-avatar__name">{user?.name}</p>
              <p className="profile-avatar__email">{user?.email}</p>
              <span className="badge badge-dark" style={{ marginTop: '6px' }}>
                {user?.role === 'ADMIN' ? 'Admin' : 'Khách hàng'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, marginBottom: '24px' }}>
              Thông tin cá nhân
            </h3>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email}
                  disabled
                  style={{ opacity: 0.5 }}
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
                <label className="form-label">Địa chỉ</label>
                <textarea
                  className="form-input"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Địa chỉ giao hàng mặc định"
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Cập nhật thông tin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
