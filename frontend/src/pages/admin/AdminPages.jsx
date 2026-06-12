import { useState, useEffect } from 'react';
import { categoryService } from '../../services/product.service';
import { orderService, adminService } from '../../services/order.service';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

// ── Categories ──────────────────────────────────────────
export function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = async () => {
    setLoading(true);
    try { const res = await categoryService.getCategories(); setCats(res.data.data || []); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editing) await categoryService.updateCategory(editing.id, form);
      else await categoryService.createCategory(form);
      await fetch();
      setShowForm(false);
    } catch (e) { setError(e.response?.data?.message || 'Có lỗi xảy ra.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa danh mục này?')) return;
    try { await categoryService.deleteCategory(id); await fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Không thể xóa.'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Danh mục</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true); }}>
          + Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên danh mục *</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Lưu'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Tên</th><th>Slug</th><th>Sản phẩm</th><th>Mô tả</th><th>Hành động</th></tr></thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>{c.slug}</td>
                  <td>{c._count?.products || 0}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: 200 }}>{c.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true); }}>
                        Sửa
                      </button>
                      <button className="btn btn-sm" style={{ border: '1px solid var(--red)', color: 'var(--red)' }}
                        onClick={() => handleDelete(c.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Orders ──────────────────────────────────────────────
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS = { PENDING: 'Chờ xử lý', CONFIRMED: 'Xác nhận', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
const STATUS_COLORS = { PENDING: '#d97706', CONFIRMED: '#2563eb', SHIPPING: '#7c3aed', COMPLETED: '#16a34a', CANCELLED: '#dc2626' };

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders({ status: statusFilter || undefined, limit: 50 });
      setOrders(res.data.data.orders || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try { await orderService.updateOrderStatus(id, status); await fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Có lỗi xảy ra.'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Đơn hàng</h1>
        <select className="form-select" style={{ width: 200 }} value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="table">
            <thead><tr>
              <th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th>
              <th>Tổng tiền</th><th>TT TT</th><th>Trạng thái</th><th>Cập nhật</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 500, fontSize: '0.8rem' }}>#{o.id.slice(-8).toUpperCase()}</td>
                  <td>
                    <p style={{ fontSize: '16px' }}>{o.user?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--mid-gray)' }}>{o.user?.email}</p>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--mid-gray)' }}>{formatDate(o.createdAt)}</td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(o.totalAmount)}</td>
                  <td>
                    <span style={{ fontSize: '0.7rem', color: o.paymentStatus === 'PAID' ? '#16a34a' : '#d97706' }}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', fontSize: '0.65rem',
                      color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}`
                    }}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: 130, fontSize: '0.75rem', padding: '6px 8px' }}
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={e => handleStatusUpdate(o.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Users ──────────────────────────────────────────────
export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: search || undefined, limit: 50 });
      setUsers(res.data.data.users || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleToggle = async (id, isActive) => {
    setUpdating(id);
    try { await adminService.updateUserStatus(id, !isActive); await fetch(); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Người dùng</h1>
        <form onSubmit={e => { e.preventDefault(); fetch(); }} style={{ display: 'flex', gap: '8px' }}>
          <input className="form-input" style={{ width: 240 }} placeholder="Tìm kiếm..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Tìm</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="table">
            <thead><tr>
              <th>Tên</th><th>Email</th><th>SĐT</th><th>Ngày đăng ký</th><th>Trạng thái</th><th>Hành động</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{u.email}</td>
                  <td style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>{u.phone || '—'}</td>
                  <td style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-dark' : 'badge-light'}`}>
                      {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        border: `1px solid ${u.isActive ? 'var(--red)' : 'var(--black)'}`,
                        color: u.isActive ? 'var(--red)' : 'var(--black)'
                      }}
                      disabled={updating === u.id}
                      onClick={() => handleToggle(u.id, u.isActive)}
                    >
                      {updating === u.id ? '...' : u.isActive ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
