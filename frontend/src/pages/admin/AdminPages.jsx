import { useEffect, useState } from 'react';
import { categoryService } from '../../services/product.service';
import { adminService, orderService } from '../../services/order.service';
import { couponService } from '../../services/coupon.service';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (date) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

function ConfirmModal({
  title,
  message,
  confirmText,
  confirmClassName = 'btn-primary',
  loading,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <div className="admin-modal-overlay" onClick={() => !loading && onClose()}>
      <div className="admin-modal admin-confirm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal__header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Đóng">
            ×
          </button>
        </div>
        <p className="admin-confirm-modal__message">{message}</p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="admin-confirm-modal__actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            type="button"
            className={`btn btn-sm ${confirmClassName}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateForm = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await categoryService.updateCategory(editing.id, form);
        setNotice('Cập nhật danh mục thành công.');
      } else {
        await categoryService.createCategory(form);
        setNotice('Thêm danh mục mới thành công.');
      }
      await loadCategories();
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await categoryService.deleteCategory(deleteTarget.id);
      await loadCategories();
      setDeleteTarget(null);
      setNotice('Xóa danh mục thành công.');
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.message || 'Không thể xóa danh mục.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Danh mục</h1>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Thêm danh mục
        </button>
      </div>

      {notice && (
        <div className="alert alert-success admin-page-notice">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => !saving && setShowForm(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
              <button type="button" onClick={() => setShowForm(false)} disabled={saving}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên danh mục *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Xóa danh mục"
          message={`Bạn có chắc muốn xóa danh mục “${deleteTarget.name}”? Danh mục đang có sản phẩm sẽ không thể xóa.`}
          confirmText="Xóa danh mục"
          confirmClassName="btn-danger"
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleteTarget(null);
            setDeleteError('');
          }}
        />
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="admin-table-card">
          <table className="table">
            <thead>
              <tr><th>Tên</th><th>Sản phẩm</th><th>Mô tả</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="font-medium">{category.name}</td>
                  <td>{category._count?.products || 0}</td>
                  <td className="admin-table-description">{category.description || '—'}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditing(category);
                          setForm({ name: category.name, description: category.description || '' });
                          setError('');
                          setShowForm(true);
                        }}
                      >
                        Sửa
                      </button>
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setDeleteTarget(category)}>
                        Xóa
                      </button>
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

// ── Coupons ─────────────────────────────────────────────
const EMPTY_COUPON = {
  code: '', description: '', discountType: 'PERCENT', discountValue: '',
  minOrderValue: '', maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true,
};

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = async () => {
    setLoading(true);
    try { const res = await couponService.getCoupons(); setCoupons(res.data.data || []); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_COUPON); setError(''); setShowForm(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue ?? '',
      maxDiscount: c.maxDiscount ?? '',
      usageLimit: c.usageLimit ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      isActive: c.isActive,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue === '' ? 0 : Number(form.minOrderValue),
        maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        expiresAt: form.expiresAt || null,
      };
      if (editing) await couponService.updateCoupon(editing.id, payload);
      else await couponService.createCoupon(payload);
      await fetch();
      setShowForm(false);
    } catch (e) { setError(e.response?.data?.message || 'Có lỗi xảy ra.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    try { await couponService.deleteCoupon(id); await fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Không thể xóa.'); }
  };

  const formatValue = (c) =>
    c.discountType === 'PERCENT' ? `${Number(c.discountValue)}%` : formatPrice(c.discountValue);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Mã giảm giá</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm mã</button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Mã *</label>
                <input className="form-input" style={{ textTransform: 'uppercase' }} value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <input className="form-input" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Loại</label>
                  <select className="form-select" value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                    <option value="PERCENT">Theo % </option>
                    <option value="FIXED">Số tiền cố định</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">{form.discountType === 'PERCENT' ? 'Phần trăm giảm (%) *' : 'Số tiền giảm (đ) *'}</label>
                  <input className="form-input" type="number" min="0" value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Đơn tối thiểu (đ)</label>
                  <input className="form-input" type="number" min="0" value={form.minOrderValue}
                    onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} />
                </div>
                {form.discountType === 'PERCENT' && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Giảm tối đa (đ)</label>
                    <input className="form-input" type="number" min="0" value={form.maxDiscount}
                      onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Giới hạn lượt dùng</label>
                  <input className="form-input" type="number" min="0" placeholder="Không giới hạn" value={form.usageLimit}
                    onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Ngày hết hạn</label>
                  <input className="form-input" type="date" value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  Đang kích hoạt
                </label>
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
      ) : coupons.length === 0 ? (
        <p style={{ color: 'var(--mid-gray)' }}>Chưa có mã giảm giá nào.</p>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="table">
            <thead><tr>
              <th>Mã</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Đã dùng</th><th>Hết hạn</th><th>Trạng thái</th><th>Hành động</th>
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.code}</td>
                  <td>{formatValue(c)}</td>
                  <td>{Number(c.minOrderValue) > 0 ? formatPrice(c.minOrderValue) : '—'}</td>
                  <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--mid-gray)' }}>{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-dark' : 'badge-light'}`}>
                      {c.isActive ? 'Kích hoạt' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Sửa</button>
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
const STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};
const PAYMENT_LABELS = {
  UNPAID: 'Chưa thanh toán',
  PENDING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-order-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3>Chi tiết đơn #{order.id.slice(-8).toUpperCase()}</h3>
            <p className="admin-modal__subtitle">{formatDate(order.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className="admin-order-detail-grid">
          <section>
            <span>Khách hàng</span>
            <strong>{order.user?.name || order.shippingName}</strong>
            {order.user?.email && <p>{order.user.email}</p>}
          </section>
          <section>
            <span>Người nhận</span>
            <strong>{order.shippingName}</strong>
            <p>{order.shippingPhone}</p>
          </section>
          <section className="admin-order-detail-address">
            <span>Địa chỉ giao hàng</span>
            <strong>{order.shippingAddress}</strong>
          </section>
          <section>
            <span>Thanh toán</span>
            <strong>{order.paymentMethod}</strong>
            <p>{PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}</p>
          </section>
          <section>
            <span>Trạng thái đơn hàng</span>
            <span className={`admin-order-status ${order.status.toLowerCase()}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </section>
        </div>

        <div className="admin-order-detail-items">
          <h4>Sản phẩm</h4>
          {order.items.map((item) => (
            <div className="admin-order-detail-item" key={item.id}>
              <div>
                <strong>{item.productName}</strong>
                {(item.size || item.color) && (
                  <span>{[item.size, item.color].filter(Boolean).join(' · ')}</span>
                )}
              </div>
              <span>{item.quantity} × {formatPrice(item.price)}</span>
              <strong>{formatPrice(Number(item.price) * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="admin-order-detail-total">
          <span>Tổng cộng</span>
          <strong>{formatPrice(order.totalAmount)}</strong>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [updateError, setUpdateError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders({ status: statusFilter || undefined, limit: 50 });
      setOrders(response.data.data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    setUpdateError('');
    try {
      await orderService.updateOrderStatus(id, status);
      await loadOrders();
      setCancelTarget(null);
    } catch (requestError) {
      setUpdateError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = (order, nextStatus) => {
    if (nextStatus === 'CANCELLED') {
      setUpdateError('');
      setCancelTarget(order);
      return;
    }
    updateStatus(order.id, nextStatus);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Đơn hàng</h1>
        <select
          className="form-select admin-header-control"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>

      {updateError && !cancelTarget && <div className="alert alert-error">{updateError}</div>}

      {cancelTarget && (
        <ConfirmModal
          title="Hủy đơn hàng"
          message={`Admin có quyền hủy đơn #${cancelTarget.id.slice(-8).toUpperCase()}. Bạn có chắc muốn chuyển đơn này sang trạng thái “Đã hủy”?`}
          confirmText="Xác nhận hủy"
          confirmClassName="btn-danger"
          loading={updating === cancelTarget.id}
          error={updateError}
          onConfirm={() => updateStatus(cancelTarget.id, 'CANCELLED')}
          onClose={() => {
            setCancelTarget(null);
            setUpdateError('');
          }}
        />
      )}

      <OrderDetailModal order={detailTarget} onClose={() => setDetailTarget(null)} />

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="admin-table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th>
                <th>Trạng thái thanh toán</th><th>Trạng thái đơn hàng</th><th>Cập nhật</th><th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="admin-order-code">#{order.id.slice(-8).toUpperCase()}</td>
                  <td>
                    <p>{order.user?.name}</p>
                    <p className="admin-cell-subtext">{order.user?.email}</p>
                  </td>
                  <td className="admin-cell-muted">{formatDate(order.createdAt)}</td>
                  <td className="font-medium">{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span className={`admin-payment-status ${order.paymentStatus?.toLowerCase()}`}>
                      {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-order-status ${order.status.toLowerCase()}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select admin-status-select"
                      value={order.status}
                      disabled={updating === order.id || order.status === 'CANCELLED'}
                      title={order.status === 'CANCELLED' ? 'Đơn đã hủy không thể đổi trạng thái' : ''}
                      onChange={(event) => handleStatusChange(order, event.target.value)}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setDetailTarget(order)}>
                      Xem chi tiết
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

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toggleTarget, setToggleTarget] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState('');
  const [historyTarget, setHistoryTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [orderDetail, setOrderDetail] = useState(null);

  const loadUsers = async (searchValue = search, statusValue = statusFilter) => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        search: searchValue.trim() || undefined,
        isActive: statusValue || undefined,
        limit: 50,
      });
      setUsers(response.data.data.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadUsers(search, statusFilter), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search, statusFilter]);

  const handleToggle = async () => {
    setUpdating(true);
    setActionError('');
    try {
      await adminService.updateUserStatus(toggleTarget.id, !toggleTarget.isActive);
      await loadUsers();
      setToggleTarget(null);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản.');
    } finally {
      setUpdating(false);
    }
  };

  const openHistory = async (user) => {
    setHistoryTarget(user);
    setHistory([]);
    setHistoryError('');
    setHistoryLoading(true);
    try {
      const response = await adminService.getUserOrders(user.id);
      setHistory(response.data.data || []);
    } catch (requestError) {
      setHistoryError(requestError.response?.data?.message || 'Không thể tải lịch sử mua hàng.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header admin-page-header--users">
        <h1>Người dùng</h1>
        <div className="admin-user-filters">
          <input
            className="form-input"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>
        </div>
      </div>

      {toggleTarget && (
        <ConfirmModal
          title={toggleTarget.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          message={
            toggleTarget.isActive
              ? `Bạn có chắc muốn khóa tài khoản của “${toggleTarget.name}”? Người dùng sẽ không thể đăng nhập.`
              : `Bạn có chắc muốn mở khóa tài khoản của “${toggleTarget.name}”?`
          }
          confirmText={toggleTarget.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
          confirmClassName={toggleTarget.isActive ? 'btn-danger' : 'btn-primary'}
          loading={updating}
          error={actionError}
          onConfirm={handleToggle}
          onClose={() => {
            setToggleTarget(null);
            setActionError('');
          }}
        />
      )}

      {historyTarget && (
        <div className="admin-modal-overlay" onClick={() => setHistoryTarget(null)}>
          <div className="admin-modal admin-history-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <div>
                <h3>Lịch sử mua hàng</h3>
                <p className="admin-modal__subtitle">{historyTarget.name} · {historyTarget.email}</p>
              </div>
              <button type="button" onClick={() => setHistoryTarget(null)} aria-label="Đóng">×</button>
            </div>
            {historyLoading ? (
              <div className="loading-center admin-history-loading"><div className="spinner spinner-lg" /></div>
            ) : historyError ? (
              <div className="alert alert-error">{historyError}</div>
            ) : history.length === 0 ? (
              <div className="admin-empty-state">Khách hàng chưa có đơn mua nào.</div>
            ) : (
              <div className="admin-history-list">
                {history.map((order) => (
                  <button
                    type="button"
                    className="admin-history-item"
                    key={order.id}
                    onClick={() => setOrderDetail(order)}
                  >
                    <div>
                      <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                      <span>{formatDate(order.createdAt)} · {order.items.length} sản phẩm</span>
                    </div>
                    <div className="admin-history-item__right">
                      <strong>{formatPrice(order.totalAmount)}</strong>
                      <span className={`admin-order-status ${order.status.toLowerCase()}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="admin-history-products">
                      {order.items.map((item) => (
                        <span key={item.id}>
                          {item.productName} × {item.quantity}
                          {item.size || item.color ? ` (${[item.size, item.color].filter(Boolean).join(', ')})` : ''}
                        </span>
                      ))}
                    </div>
                    <span className="admin-history-item__view">Xem chi tiết →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <OrderDetailModal order={orderDetail} onClose={() => setOrderDetail(null)} />

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="admin-table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th><th>Email</th><th>SĐT</th><th>Ngày đăng ký</th>
                <th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="admin-cell-muted">{user.phone || '—'}</td>
                  <td className="admin-cell-muted">{formatDate(user.createdAt)}</td>
                  <td>
                    <span className={`admin-user-status ${user.isActive ? 'active' : 'locked'}`}>
                      <span />
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openHistory(user)}>
                        Lịch sử
                      </button>
                      <button
                        className={`btn btn-sm ${user.isActive ? 'btn-danger-outline' : 'btn-primary'}`}
                        onClick={() => {
                          setActionError('');
                          setToggleTarget(user);
                        }}
                      >
                        {user.isActive ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="admin-empty-state">Không tìm thấy người dùng phù hợp.</div>
          )}
        </div>
      )}
    </div>
  );
}
