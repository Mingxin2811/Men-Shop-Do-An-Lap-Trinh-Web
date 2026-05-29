import { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services/product.service';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const emptyVariant = () => ({ size: '', color: '', stock: 0 });

function defaultForm(product) {
  return product ? {
    categoryId: product.categoryId || '',
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    imageUrl: product.imageUrl || '',
    stock: product.stock ?? '',
    isActive: Boolean(product.isActive),
    variants: product.variants?.length
      ? product.variants.map(v => ({
          size: v.size || '',
          color: v.color || '',
          stock: v.stock ?? 0,
        }))
      : [],
  } : {
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
    isActive: true,
    variants: [],
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getAdminProducts({
          limit: 100,
          status: statusFilter,
          ...(search && { search }),
        }),
        categoryService.getCategories(),
      ]);
      setProducts(pRes.data.data.products || []);
      setCategories(cRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [statusFilter]);

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm(defaultForm(product));
    setError('');
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setForm(defaultForm());
    setError('');
    setShowForm(true);
  };

  const updateVariant = (index, field, value) => {
    setForm(current => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const removeVariant = (index) => {
    setForm(current => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => ({
    ...form,
    price: parseFloat(form.price),
    stock: parseInt(form.stock, 10),
    isActive: Boolean(form.isActive),
    variants: form.variants
      .filter(v => v.size.trim() && v.color.trim())
      .map(v => ({
        size: v.size.trim(),
        color: v.color.trim(),
        stock: parseInt(v.stock, 10) || 0,
      })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = buildPayload();
      if (editing) await productService.updateProduct(editing, data);
      else await productService.createProduct(data);
      await fetchProducts();
      setShowForm(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = !product.isActive;
    const label = nextStatus ? 'hiển thị lại' : 'ẩn';
    if (!confirm(`Bạn muốn ${label} sản phẩm này?`)) return;

    try {
      await productService.updateProduct(product.id, { isActive: nextStatus });
      await fetchProducts();
    } catch (e) {
      alert(e.response?.data?.message || 'Không thể cập nhật trạng thái sản phẩm.');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sản phẩm</h1>
        <button className="btn btn-primary" onClick={handleNew}>+ Thêm sản phẩm</button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <form onSubmit={e => { e.preventDefault(); fetchProducts(); }} style={{ display: 'flex', gap: '8px' }}>
          <input
            className="form-input"
            style={{ width: 260 }}
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Tìm</button>
        </form>

        <select
          className="form-select"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button type="button" onClick={() => setShowForm(false)}>x</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select
                  className="form-select"
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Giá (VND) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.price}
                    min="1"
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tồn kho tổng *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.stock}
                    min="0"
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">URL ảnh</label>
                <input
                  className="form-input"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  Hiển thị sản phẩm trên website
                </label>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Size / màu</label>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setForm(f => ({ ...f, variants: [...f.variants, emptyVariant()] }))}
                  >
                    + Thêm biến thể
                  </button>
                </div>

                {form.variants.length === 0 ? (
                  <p style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>
                    Chưa có biến thể. Sản phẩm sẽ dùng tồn kho tổng.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {form.variants.map((variant, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 110px auto',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <input
                          className="form-input"
                          placeholder="Size"
                          value={variant.size}
                          onChange={e => updateVariant(index, 'size', e.target.value)}
                        />
                        <input
                          className="form-input"
                          placeholder="Màu"
                          value={variant.color}
                          onChange={e => updateVariant(index, 'color', e.target.value)}
                        />
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          value={variant.stock}
                          onChange={e => updateVariant(index, 'stock', e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ border: '1px solid var(--red)', color: 'var(--red)' }}
                          onClick={() => removeVariant(index)}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Biến thể</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: 48, height: 60, objectFit: 'cover', background: 'var(--warm-gray)' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: 220 }}>{product.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{product.category?.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <span style={{ color: product.stock < 5 ? 'var(--red)' : 'inherit' }}>{product.stock}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 180 }}>
                    {product.variants?.length
                      ? product.variants.map(v => `${v.size}/${v.color}: ${v.stock}`).join(', ')
                      : 'Không có'}
                  </td>
                  <td>
                    <span className={`badge ${product.isActive ? 'badge-dark' : 'badge-light'}`}>
                      {product.isActive ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(product)}>Sửa</button>
                      <button
                        className="btn btn-sm"
                        style={{
                          border: `1px solid ${product.isActive ? 'var(--red)' : 'var(--black)'}`,
                          color: product.isActive ? 'var(--red)' : 'var(--black)',
                        }}
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.isActive ? 'Ẩn' : 'Hiện'}
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
