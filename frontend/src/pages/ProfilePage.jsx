import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { useToast } from '../contexts/ToastContext';
import './ProfilePage.css';

const AVATAR_PRESETS = [
  { id: 'cat', label: 'Mèo', emoji: '🐱', background: '#f8d9a0' },
  { id: 'dog', label: 'Chó', emoji: '🐶', background: '#d9c1a5' },
  { id: 'fox', label: 'Cáo', emoji: '🦊', background: '#f4b27a' },
  { id: 'panda', label: 'Gấu trúc', emoji: '🐼', background: '#d9e2e5' },
  { id: 'bear', label: 'Gấu', emoji: '🐻', background: '#d8b18a' },
  { id: 'lion', label: 'Sư tử', emoji: '🦁', background: '#f1ca72' },
];

function Avatar({ value, name, className = '' }) {
  if (value?.startsWith('data:image/')) {
    return <img className={`profile-avatar__image ${className}`} src={value} alt="Ảnh đại diện" />;
  }

  const preset = AVATAR_PRESETS.find(item => `preset:${item.id}` === value);
  if (preset) {
    return (
      <span
        className={`profile-avatar__preset ${className}`}
        style={{ background: preset.background }}
        role="img"
        aria-label={preset.label}
      >
        {preset.emoji}
      </span>
    );
  }

  return <span className={`profile-avatar__initial ${className}`}>{name?.[0]?.toUpperCase() || '?'}</span>;
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Tệp đã chọn không phải ảnh hợp lệ.'));
      image.onload = () => {
        const maxSize = 360;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleAvatarFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tệp ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh đại diện không được vượt quá 5 MB.');
      return;
    }

    try {
      const avatar = await resizeImage(file);
      setForm(current => ({ ...current, avatar }));
    } catch (uploadError) {
      toast.error(uploadError.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const response = await authService.updateProfile(form);
      updateUser(response.data.data.user);
      setSuccess('Cập nhật thành công!');
      toast.success('Cập nhật thông tin thành công');
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Có lỗi xảy ra.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (pwForm.newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    try {
      setPwLoading(true);
      await authService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Đổi mật khẩu thành công');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-page container">
      <div className="page-header">
        <h1>Tài khoản</h1>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <div className="profile-avatar__circle">
              <Avatar value={form.avatar} name={form.name || user?.name} />
            </div>
            <div>
              <p className="profile-avatar__name">{form.name || user?.name}</p>
              <p className="profile-avatar__email">{user?.email}</p>
              <span className="badge badge-dark profile-avatar__role">
                {user?.role === 'ADMIN' ? 'Admin' : 'Khách hàng'}
              </span>
            </div>
          </div>
        </aside>

        <div className="profile-content">
          <div className="card">
            <h3 className="profile-card-title">Thông tin cá nhân</h3>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ảnh đại diện</label>
                <div className="profile-avatar-editor">
                  <div className="profile-avatar-editor__preview">
                    <Avatar value={form.avatar} name={form.name || user?.name} />
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="profile-avatar-editor__input"
                      onChange={handleAvatarFile}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Chọn ảnh từ thiết bị
                    </button>
                    <p className="profile-avatar-editor__hint">PNG, JPG hoặc WebP, tối đa 5 MB.</p>
                  </div>
                </div>

                <p className="profile-avatar-presets__label">Hoặc chọn avatar hoạt họa</p>
                <div className="profile-avatar-presets">
                  {AVATAR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`profile-avatar-preset${form.avatar === `preset:${preset.id}` ? ' active' : ''}`}
                      style={{ background: preset.background }}
                      onClick={() => setForm(current => ({ ...current, avatar: `preset:${preset.id}` }))}
                      title={preset.label}
                      aria-label={`Chọn avatar ${preset.label}`}
                    >
                      {preset.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={user?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={event => setForm(current => ({ ...current, phone: event.target.value }))}
                  placeholder="Có thể nhập theo định dạng bạn muốn"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <textarea
                  className="form-input"
                  value={form.address}
                  onChange={event => setForm(current => ({ ...current, address: event.target.value }))}
                  placeholder="Địa chỉ giao hàng mặc định"
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Cập nhật thông tin'}
              </button>
            </form>
          </div>

          <div className="card profile-password-card">
            <h3 className="profile-card-title">Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-input"
                  value={pwForm.currentPassword}
                  onChange={event => setPwForm(current => ({ ...current, currentPassword: event.target.value }))}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-input"
                  value={pwForm.newPassword}
                  onChange={event => setPwForm(current => ({ ...current, newPassword: event.target.value }))}
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="form-input"
                  value={pwForm.confirmPassword}
                  onChange={event => setPwForm(current => ({ ...current, confirmPassword: event.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                {pwLoading ? <span className="spinner" /> : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
