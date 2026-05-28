import { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services/product.service';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function defaultForm(p) {
    return p ? {
      categoryId: p.categoryId,
      name: p.name, description: p.description,
      price: p.price, imageUrl: p.imageUrl, stock: p.stock,
    } : { categoryId: '', name: '', description: '', price: '', imageUrl: '', stock: '' };
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories(),
      ]);
      setProducts(pRes.data.data.products || []);
      setCategories(cRes.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm(defaultForm(p));
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setForm(defaultForm());
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editing) await productService.updateProduct(editing, data);
      else await productService.createProduct(data);
      await fetchProducts();
      setShowForm(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ẩn sản phẩm này?')) return;
    try { await productService.deleteProduct(id); await fetchProducts(); } catch {}
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sản phẩm</h1>
        <button className="btn btn-primary" onClick={handleNew}>+ Thêm sản phẩm</button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select className="form-select" value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Giá (VND) *</label>
                  <input type="number" className="form-input" value={form.price} min="0"
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tồn kho *</label>
                  <input type="number" className="form-input" value={form.stock} min="0"
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL ảnh</label>
                <input className="form-input" value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
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
            <thead><tr>
              <th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th>
              <th>Tồn kho</th><th>Trạng thái</th><th>Hành động</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <img src={p.imageUrl} alt={p.name}
                      style={{ width: 48, height: 60, objectFit: 'cover', background: 'var(--warm-gray)' }}
                      onError={e => e.target.style.display = 'none'} />
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: 200 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.category?.name}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <span style={{ color: p.stock < 5 ? 'var(--red)' : 'inherit' }}>{p.stock}</span>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-dark' : 'badge-light'}`}>
                      {p.isActive ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>Sửa</button>
                      {p.isActive && (
                        <button className="btn btn-sm" style={{ border: '1px solid var(--red)', color: 'var(--red)' }}
                          onClick={() => handleDelete(p.id)}>Ẩn</button>
                      )}
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
